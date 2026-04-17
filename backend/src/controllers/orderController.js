const prisma = require('../config/prisma');

const orderController = {
  // Lấy danh sách Đơn Hàng
  getAllOrders: async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
          shipping: true
        }
      });
      res.status(200).json({ data: orders });
    } catch (error) {
      console.error("Lỗi get orders:", error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lấy chi tiết một Đơn Hàng (dùng cho in ấn hoặc xem chi tiết)
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: {
          customer: true,
          user: { select: { fullName: true } },
          shipping: true,
          items: {
            include: {
              variant: {
                include: { product: true }
              }
            }
          }
        }
      });

      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      
      // Chuyển đổi format items để tương thích với template in
      const formattedOrder = {
        ...order,
        orderItems: order.items.map(item => ({
          name: item.variant?.product?.name || 'Sản phẩm',
          productVariant: { name: item.variant?.attributes ? Object.values(item.variant.attributes).join(' - ') : '' },
          quantity: item.quantity,
          price: item.price,
          unit: 'Cái' // Hoặc lấy từ product model nếu có
        }))
      };

      res.status(200).json({ data: formattedOrder });
    } catch (error) {
      console.error("Lỗi get order details:", error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lõi tạo Đơn hàng POS
  createOrder: async (req, res) => {
    try {
      const { customerId, items, discount = 0, paidAmount = 0, paymentMethod = 'Tiền mặt' } = req.body;
      const userId = req.user.userId; // Trích từ JWT middleware

      if (!customerId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Khách hàng và Giỏ hàng không được để trống' });
      }

      // Xác thực danh mục hàng tồn trước khi chốt đơn
      const variantIds = items.map(item => item.variantId);
      const variantsInDb = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } }
      });

      // Recalculate total Amount to prevent tampered frontend request
      let totalAmount = 0;
      for (const item of items) {
        const matchingVariant = variantsInDb.find(v => v.id === item.variantId);
        if (!matchingVariant) return res.status(400).json({ message: `Mã sản phẩm ${item.variantId} không hợp lệ` });
        if (matchingVariant.stockCount < item.quantity) {
          return res.status(400).json({ message: `Sản phẩm SKU: ${matchingVariant.sku} không đủ tồn kho! (Tồn: ${matchingVariant.stockCount})` });
        }
        totalAmount += Number(item.price) * Number(item.quantity);
      }

      const finalAmount = totalAmount - discount;
      const amountToPay = Number(paidAmount);
      const debtDifference = finalAmount - amountToPay;

      // Sinh mã Code tự động: ORD + Time
      const orderCode = 'ORD' + Date.now().toString().slice(-6);
      let orderStatus = 'PENDING'; // Khởi tạo chờ duyệt

      // Bắt đầu PRISMA TRANSACTION
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. Tạo Đơn hàng
        const newOrder = await tx.order.create({
          data: {
            code: orderCode,
            customerId: Number(customerId),
            userId: Number(userId),
            totalAmount,
            discount,
            finalAmount,
            paidAmount: amountToPay,
            status: orderStatus,
            items: {
              create: items.map(i => ({
                variantId: Number(i.variantId),
                batchId: i.batchId ? Number(i.batchId) : null,
                quantity: Number(i.quantity),
                price: Number(i.price)
              }))
            }
          },
          include: {
            customer: true,
            user: true,
            items: {
              include: {
                variant: {
                  include: { product: true }
                }
              }
            }
          }
        });



        // 3. Ghi nợ nếu thu thiếu tiền
        if (debtDifference > 0) {
          await tx.partner.update({
            where: { id: Number(customerId) },
            data: {
              debtBalance: {
                increment: debtDifference
              }
            }
          });
        } else if (debtDifference < 0) {
           // Khách trả dư -> Ghi hụt nợ hoặc giữ tiền cọc (Ở mức cơ bản, ta trừ nợ)
           await tx.partner.update({
            where: { id: Number(customerId) },
            data: {
              debtBalance: {
                decrement: Math.abs(debtDifference) // decrement expected
              }
            }
          });
        }

        // 4. Nếu có trả tiền mặt/CK -> Ghi vào Sổ Quỹ
        if (amountToPay > 0) {
          const paymentCode = 'REC' + Date.now().toString().slice(-6);
          await tx.payment.create({
            data: {
              code: paymentCode,
              type: 'INCOME',
              amount: amountToPay,
              partnerId: Number(customerId),
              orderId: newOrder.id,
              method: paymentMethod,
              note: `Thanh toán cho đơn bán hàng ${orderCode}`
            }
          });
        }

        return newOrder;
      });

      res.status(201).json({ message: 'Chốt đơn thành công!', data: result });
    } catch (error) {
      console.error("Lỗi khi tạo đơn POS:", error);
      res.status(500).json({ message: 'Lỗi server bảo mật khi giao dịch chốt đơn', error: error.message });
    }
  },

  // API Duyệt Đơn Hàng (Xả tồn kho)
  approveOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: { items: true }
      });

      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      if (order.status !== 'PENDING') return res.status(400).json({ message: 'Đơn hàng không ở trạng thái Chờ duyệt' });

      await prisma.$transaction(async (tx) => {
        // 1. Cập nhật status Hoàn thành
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' }
        });

        // 2. Trừ tồn kho TỔNG và Xử lý Lô (Batch)
        for (const item of order.items) {
          const qtyToDeduct = Number(item.quantity);

          // 2.1 Trừ Tồn kho tổng ProductVariant
          await tx.productVariant.update({
            where: { id: Number(item.variantId) },
            data: { stockCount: { decrement: qtyToDeduct } }
          });

          // 2.2 Xử lý Tồn Kho Lô (Batch)
          if (item.batchId) {
            await tx.batch.update({
              where: { id: Number(item.batchId) },
              data: { currentQty: { decrement: qtyToDeduct } }
            });
          } else {
            const batches = await tx.batch.findMany({
              where: { variantId: Number(item.variantId), currentQty: { gt: 0 } },
              orderBy: [
                { currentQty: 'asc' }, 
                { id: 'asc' }          
              ]
            });

            let remainingQty = qtyToDeduct;
            for (const b of batches) {
              if (remainingQty <= 0) break;
              const deductAmount = Math.min(b.currentQty, remainingQty);
              await tx.batch.update({
                where: { id: b.id },
                data: { currentQty: { decrement: deductAmount } }
              });
              remainingQty -= deductAmount;
            }
          }
        }
      });

      res.status(200).json({ message: 'Duyệt đơn và xuất kho thành công!' });
    } catch (error) {
      console.error("Lỗi khi duyệt đơn:", error);
      res.status(500).json({ message: 'Lỗi server khi duyệt đơn' });
    }
  }
};

module.exports = orderController;
