const prisma = require('../config/prisma');

const productController = {
  // Lấy danh sách biến thể sản phẩm có sẵn để cho POS quét
  getVariantsForSale: async (req, res) => {
    try {
      const variants = await prisma.productVariant.findMany({
        include: {
          product: true, // Gắn kèm thông tin Món chính (Name)
          batches: {
            where: { currentQty: { gt: 0 } },
            orderBy: { expiryDate: 'asc' } // Ưu tiên xuất lô cận date hoặc nhập trước
          }
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
          variants: {
            include: {
              batches: true
            }
          }
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
  },

  // Tạo mới sản phẩm và biến thể kèm theo
  createProduct: async (req, res) => {
    try {
      const { name, description, categoryId, variants } = req.body;

      if (!name || !categoryId) {
        return res.status(400).json({ message: 'Vui lòng nhập Tên sản phẩm và chọn Danh mục' });
      }

      if (!variants || variants.length === 0) {
        return res.status(400).json({ message: 'Sản phẩm phải có ít nhất 1 biến thể (quy cách/phân loại)' });
      }

      // Tự động sinh mã SP:
      const uniqueSuffix = Date.now().toString().slice(-6); 
      const generatedCode = `SP${uniqueSuffix}`; // ví dụ: SP123456

      // Format dữ liệu biến thể
      const mappedVariants = variants.map((v, index) => {
        // Tự sinh SKU nếu bỏ trống
        const autoSku = v.sku || `SKU-${generatedCode}-${index + 1}`;
        // Nếu client truyền "Màu Đen, L" dưới dạng chuỗi `attributes`
        const attributesJson = typeof v.attributes === 'string' 
          ? { details: v.attributes } 
          : (v.attributes || { details: "Mặc định" });

        return {
          sku: autoSku,
          attributes: attributesJson,
          importPrice: parseFloat(v.importPrice) || 0,
          sellPrice: parseFloat(v.sellPrice) || 0,
          stockCount: 0, // Mặc định kế toán
          minStockLevel: parseInt(v.minStockLevel) || 5
        };
      });

      // Tạo Sản phẩm mẹ và list con trong 1 transaction
      const newProduct = await prisma.product.create({
        data: {
          code: generatedCode,
          name: name,
          description: description || null,
          categoryId: parseInt(categoryId),
          variants: {
            create: mappedVariants
          }
        },
        include: {
          variants: true,
          category: true
        }
      });

      res.status(201).json({ message: 'Tạo sản phẩm thành công', product: newProduct });
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      res.status(500).json({ message: 'Lỗi server khi tạo sản phẩm', error: error.message });
    }
  }
};

module.exports = productController;
