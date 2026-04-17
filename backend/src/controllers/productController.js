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
  },

  // Lấy toàn bộ danh mục sản phẩm kèm biến thể (cho màn hình Quản lý Sản phẩm)
  getAllProducts: async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: true,
          variants: true
        },
        orderBy: { code: 'asc' }
      });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tải danh sách sản phẩm', error: error.message });
    }
  },

  // Lấy toàn bộ biến thể sản phẩm (cho dropdown Nhập Kho)
  getAllVariants: async (req, res) => {
    try {
      const variants = await prisma.productVariant.findMany({
        include: {
          product: true
        },
        orderBy: { sku: 'asc' }
      });
      
      // Map lại để ghép thêm trường name từ bảng cha cho dễ xài ở frontend
      const mappedVariants = variants.map(v => ({
        ...v,
        name: v.product ? v.product.name : 'N/A'
      }));
      
      res.status(200).json(mappedVariants);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tải danh sách biến thể', error: error.message });
    }
  }
};

module.exports = productController;
