const prisma = require('../config/prisma');

const productController = {
  // Lấy danh sách biến thể sản phẩm có sẵn để cho POS quét
  getVariantsForSale: async (req, res) => {
    try {
      const variants = await prisma.productVariant.findMany({
        where: {
          stockCount: {
            gt: 0 // POS chỉ lấy những món còn hàng tồn
          }
        },
        include: {
          product: true // Gắn kèm thông tin Món chính (Name)
        }
      });
      res.status(200).json(variants);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tải danh sách sản phẩm', error: error.message });
    }
  }
};

module.exports = productController;
