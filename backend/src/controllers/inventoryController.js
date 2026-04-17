const prisma = require('../config/prisma');

const inventoryController = {
  // Lấy danh sách giao dịch kho (Phiếu Nhập/Xuất)
  getInventoryTransactions: async (req, res) => {
    try {
      const transactions = await prisma.inventoryTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { fullName: true }
          },
          partner: {
            select: { name: true }
          }
        }
      });
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tải danh sách phiếu kho', error: error.message });
    }
  },

  // Tạo Phiếu Nhập Kho
  importInventory: async (req, res) => {
    try {
      const { partnerId, note, details } = req.body;
      const userId = req.user.userId;

      // Validate input
      if (!partnerId || !details || details.length === 0) {
        return res.status(400).json({ message: 'Vui lòng cung cấp nhà cung cấp và ít nhất một mặt hàng' });
      }

      // Xử lý tổng tiền
      const totalAmount = details.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const transactionCode = 'PN' + Date.now().toString().slice(-6);

      // Bắt đầu Prisma Transaction để đảm bảo tính toàn vẹn (ACID)
      const result = await prisma.$transaction(async (tx) => {
        // 1. Tạo Phiếu Nhập
        const transaction = await tx.inventoryTransaction.create({
          data: {
            code: transactionCode,
            type: 'IMPORT',
            status: 'COMPLETED',
            userId: userId,
            partnerId: partnerId,
            note: note,
            totalAmount: totalAmount,
            paidAmount: 0 // Tuỳ logic thanh toán sau này
          }
        });

        // 2. Loop qua details để tạo chi tiết, cập nhật lượng tồn và quản lý lô
        for (const item of details) {
          let batchId = null;

          // Tạo hoặc tìm Batch nếu có mã lô
          if (item.batchNumber) {
            // Find existing batch code for this variant
            const existingBatch = await tx.batch.findUnique({
              where: {
                batchNumber_variantId: {
                  batchNumber: item.batchNumber,
                  variantId: item.variantId
                }
              }
            });

            if (existingBatch) {
              const updatedBatch = await tx.batch.update({
                where: { id: existingBatch.id },
                data: {
                  currentQty: { increment: item.quantity },
                  // Nửa sau này nếu cập nhật hạn sử dụng hoặc giá nhập có thể ghi đè
                  ...(item.expiryDate && { expiryDate: new Date(item.expiryDate) })
                }
              });
              batchId = updatedBatch.id;
            } else {
              const newBatch = await tx.batch.create({
                data: {
                  batchNumber: item.batchNumber,
                  variantId: item.variantId,
                  initialQty: item.quantity,
                  currentQty: item.quantity,
                  importPrice: item.unitPrice,
                  expiryDate: item.expiryDate ? new Date(item.expiryDate) : null
                }
              });
              batchId = newBatch.id;
            }
          }

          // Ghi Chi tiết phiếu nhập
          await tx.inventoryDetail.create({
            data: {
              transactionId: transaction.id,
              variantId: item.variantId,
              batchId: batchId,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            }
          });

          // Cập nhật stockCount trực tiếp vào ProductVariant
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockCount: {
                increment: item.quantity
              },
              // Có thể cập nhật giá nhập mới nhất vào variant (tùy nghiệp vụ)
              importPrice: item.unitPrice 
            }
          });
        }

        return transaction;
      });

      res.status(201).json({ message: 'Tạo phiếu nhập thành công', data: result });
    } catch (error) {
      console.error("Lỗi khi nhập kho:", error);
      res.status(500).json({ message: 'Lỗi khi tạo phiếu nhập', error: error.message });
    }
  }
};

module.exports = inventoryController;
