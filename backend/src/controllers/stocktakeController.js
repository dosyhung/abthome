const prisma = require('../config/prisma');

const stocktakeController = {
  // Lấy danh sách phiếu kiểm kê
  getAll: async (req, res) => {
    try {
      const stocktakes = await prisma.stocktake.findMany({
        include: {
          user: {
            select: { fullName: true }
          },
          _count: {
            select: { details: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(stocktakes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách phiếu kiểm kê', error: error.message });
    }
  },

  // Lấy chi tiết phiếu kiểm kê
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const stocktake = await prisma.stocktake.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: {
            select: { fullName: true }
          },
          details: {
            include: {
              variant: {
                include: { product: true }
              },
              batch: true
            }
          }
        }
      });
      if (!stocktake) return res.status(404).json({ message: 'Không tìm thấy phiếu kiểm kê' });
      res.status(200).json(stocktake);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi lấy chi tiết phiếu kiểm kê', error: error.message });
    }
  },

  // Tạo phiếu kiểm kê (tạo nháp - DRAFT)
  create: async (req, res) => {
    try {
      const { note, details } = req.body;
      const userId = req.user.userId; // user từ token middleware

      // Tạo mã phiếu có format KK + 6 số cuối của thời gian
      const code = 'KK' + Date.now().toString().slice(-6);

      const stocktake = await prisma.stocktake.create({
        data: {
          code,
          userId,
          note,
          status: 'DRAFT',
          details: {
            create: details.map(d => ({
              variantId: d.variantId,
              batchId: d.batchId || null,
              systemQty: d.systemQty,
              actualQty: d.actualQty,
              adjustment: d.actualQty - d.systemQty
            }))
          }
        },
        include: { details: true }
      });

      res.status(201).json(stocktake);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi tạo phiếu kiểm kê', error: error.message });
    }
  },

  // Chốt phiếu kiểm kê (Cân bằng kho)
  adjust: async (req, res) => {
    try {
      const { id } = req.params;
      
      const stocktake = await prisma.stocktake.findUnique({
        where: { id: parseInt(id) },
        include: { details: true }
      });

      if (!stocktake) return res.status(404).json({ message: 'Không tìm thấy phiếu kiểm kê' });
      if (stocktake.status === 'ADJUSTED') return res.status(400).json({ message: 'Phiếu này đã được chốt từ trước' });

      // Transaction cập nhật Tồn kho
      await prisma.$transaction(async (tx) => {
        for (const detail of stocktake.details) {
          // Ghi đè vào ProductVariant
          await tx.productVariant.update({
             where: { id: detail.variantId },
             data: { stockCount: detail.actualQty }
          });
          
          // Ghi đè cập nhật vào Batch nếu có quản lý theo lô
          if (detail.batchId) {
             await tx.batch.update({
               where: { id: detail.batchId },
               data: { currentQty: detail.actualQty }
             });
          }
        }
        
        // Cập nhật trạng thái phiếu
        await tx.stocktake.update({
          where: { id: parseInt(id) },
          data: { status: 'ADJUSTED' }
        });
      });

      res.status(200).json({ message: 'Cân bằng kho thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi chốt phiếu kiểm kê', error: error.message });
    }
  }
};

module.exports = stocktakeController;
