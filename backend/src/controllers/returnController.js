const prisma = require('../config/prisma');

const returnController = {
  // Tạo Phiếu Trả Hàng Mới
  createReturn: async (req, res) => {
    try {
      const { orderId, customerId, items, refundFee = 0, paidAmount = 0, note = '' } = req.body;
      const userId = req.user.userId;

      if (!orderId || !customerId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Thông tin phiếu trả hàng không hợp lệ' });
      }

      // Kiểm tra hóa đơn gốc có tồn tại và thuộc khách hàng không
      const originalOrder = await prisma.order.findUnique({
        where: { id: Number(orderId) }
      });

      if (!originalOrder || originalOrder.customerId !== Number(customerId)) {
        return res.status(400).json({ message: 'Hóa đơn gốc không khớp với khách hàng' });
      }

      // Tính tổng tiền hoàn lại từ các sản phẩm trả
      let totalRefundAmount = 0;
      for (const item of items) {
        totalRefundAmount += Number(item.refundPrice) * Number(item.quantity);
      }

      const finalRefundAmount = totalRefundAmount - Number(refundFee);
      const actualPaid = Number(paidAmount);
      
      // Khách trả hàng -> Mình nợ khách (finalRefundAmount).
      // Mình trả tiền mặt cho khách (actualPaid).
      // Phần còn lại (finalRefundAmount - actualPaid) là công nợ mình phải cấn trừ cho khách (giảm nợ cho khách).
      // Vì bảng Partner.debtBalance: > 0 là khách nợ mình. Nên khi khách trả hàng, nợ của khách phải GIẢM.
      const debtReduction = finalRefundAmount - actualPaid;

      // Sinh mã Code
      const returnCode = 'RET' + Date.now().toString().slice(-6);

      const result = await prisma.$transaction(async (tx) => {
        // 1. Tạo phiếu trả hàng
        const newReturn = await tx.returnOrder.create({
          data: {
            code: returnCode,
            orderId: Number(orderId),
            customerId: Number(customerId),
            userId: Number(userId),
            totalRefundAmount,
            refundFee: Number(refundFee),
            finalRefundAmount,
            paidAmount: actualPaid,
            status: 'PENDING',
            note: note,
            items: {
              create: items.map(i => ({
                variantId: Number(i.variantId),
                batchId: i.batchId ? Number(i.batchId) : null,
                quantity: Number(i.quantity),
                refundPrice: Number(i.refundPrice)
              }))
            }
          },
          include: {
            customer: true,
            user: true,
            items: {
              include: {
                variant: { include: { product: true } }
              }
            }
          }
        });

        // 2. Giảm nợ cho khách hàng (Nếu debtReduction > 0)
        // Lưu ý: Nếu debtReduction < 0 (trả tiền cho khách nhiều hơn tiền hoàn), thì nợ khách sẽ Tăng. (Ít khi xảy ra).
        if (debtReduction !== 0) {
          await tx.partner.update({
            where: { id: Number(customerId) },
            data: {
              debtBalance: {
                decrement: debtReduction
              }
            }
          });
        }

        return newReturn;
      });

      res.status(201).json({ message: 'Tạo phiếu trả hàng thành công!', data: result });
    } catch (error) {
      console.error("Lỗi khi tạo phiếu trả hàng:", error);
      res.status(500).json({ message: 'Lỗi server khi tạo phiếu trả hàng', error: error.message });
    }
  },

  // Lấy danh sách Phiếu Trả Hàng
  getAllReturns: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 11;
      const skip = (page - 1) * limit;

      const [returns, totalReturns] = await Promise.all([
        prisma.returnOrder.findMany({
          skip: skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { name: true, phone: true } },
            order: { select: { code: true } }
          }
        }),
        prisma.returnOrder.count()
      ]);

      res.status(200).json({ 
        data: returns, 
        meta: {
          totalRecords: totalReturns,
          currentPage: page,
          totalPages: Math.ceil(totalReturns / limit)
        }
      });
    } catch (error) {
      console.error("Lỗi get returns:", error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Xem chi tiết Phiếu Trả Hàng
  getReturnById: async (req, res) => {
    try {
      const { id } = req.params;
      const returnOrder = await prisma.returnOrder.findUnique({
        where: { id: Number(id) },
        include: {
          customer: true,
          user: { select: { fullName: true } },
          order: true,
          items: {
            include: {
              variant: { include: { product: true } },
              batch: true
            }
          }
        }
      });

      if (!returnOrder) return res.status(404).json({ message: 'Không tìm thấy phiếu trả hàng' });
      res.status(200).json({ data: returnOrder });
    } catch (error) {
      console.error("Lỗi get return details:", error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Duyệt phiếu trả hàng (Nhập lại kho & Chi quỹ)
  approveReturn: async (req, res) => {
    try {
      const { id } = req.params;
      const returnOrder = await prisma.returnOrder.findUnique({
        where: { id: Number(id) },
        include: { items: true }
      });

      if (!returnOrder) return res.status(404).json({ message: 'Không tìm thấy phiếu trả hàng' });
      if (returnOrder.status !== 'PENDING') return res.status(400).json({ message: 'Phiếu đã được duyệt trước đó' });

      await prisma.$transaction(async (tx) => {
        // 1. Cập nhật status Hoàn thành
        await tx.returnOrder.update({
          where: { id: returnOrder.id },
          data: { status: 'COMPLETED' }
        });

        // 2. Tăng tồn kho (Cộng ngược lại)
        for (const item of returnOrder.items) {
          const qtyToReturn = Number(item.quantity);

          // 2.1 Tăng Tồn kho tổng ProductVariant
          await tx.productVariant.update({
            where: { id: Number(item.variantId) },
            data: { stockCount: { increment: qtyToReturn } }
          });

          // 2.2 Tăng Tồn Kho Lô (Batch) nếu có
          if (item.batchId) {
            await tx.batch.update({
              where: { id: Number(item.batchId) },
              data: { currentQty: { increment: qtyToReturn } }
            });
          } else {
            // Nếu không có lô xác định cụ thể, ta cứ cộng vào lô cũ nhất của variant đó (hoặc tạo lô "Hàng trả")
            // Tạm thời để đơn giản, ta tìm lô cũ nhất và cộng vào.
            const firstBatch = await tx.batch.findFirst({
              where: { variantId: Number(item.variantId) },
              orderBy: { id: 'asc' }
            });
            if (firstBatch) {
              await tx.batch.update({
                where: { id: firstBatch.id },
                data: { currentQty: { increment: qtyToReturn } }
              });
            }
          }
        }

        // 3. Nếu có xuất tiền mặt trả lại cho khách, ghi vào Sổ Quỹ (Chi)
        if (Number(returnOrder.paidAmount) > 0) {
          const paymentCode = 'EXP' + Date.now().toString().slice(-6);
          await tx.payment.create({
            data: {
              code: paymentCode,
              type: 'EXPENSE',
              amount: Number(returnOrder.paidAmount),
              partnerId: returnOrder.customerId,
              // Vì không có returnOrderId trong Payment model, ta tạm ghi orderId là null, bù lại ghi rõ Note.
              method: 'Tiền mặt', // Hardcode hoặc có thể thêm method vào returnOrder
              note: `Chi tiền mặt hoàn trả khách hàng cho phiếu trả ${returnOrder.code}`
            }
          });
        }
      });

      res.status(200).json({ message: 'Duyệt phiếu trả hàng và nhập kho thành công!' });
    } catch (error) {
      console.error("Lỗi khi duyệt phiếu trả:", error);
      res.status(500).json({ message: 'Lỗi server khi duyệt phiếu trả' });
    }
  }
};

module.exports = returnController;
