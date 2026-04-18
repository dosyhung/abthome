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

      // Tự động sinh mã SP mới nhất dựa theo DB
      let nextNumber = 1;
      const lastProduct = await prisma.product.findFirst({
        where: { code: { startsWith: 'SP' } },
        orderBy: { id: 'desc' } // Tìm cái tạo gần nhất
      });
      if (lastProduct) {
        const match = lastProduct.code.match(/SP(\d+)/);
        if (match && match[1]) {
          nextNumber = parseInt(match[1], 10) + 1;
        } else {
          // Fallback
          nextNumber = lastProduct.id + 1; 
        }
      }
      const generatedCode = `SP${nextNumber.toString().padStart(2, '0')}`;

      // Format dữ liệu biến thể
      const mappedVariants = variants.map((v, index) => {
        // Mã con sẽ trùng mã mẹ nếu chỉ có 1 biến thể, nếu >1 thì nối đuôi
        let autoSku = generatedCode;
        if (variants.length > 1) {
           autoSku = `${generatedCode}-${index + 1}`;
        }
        autoSku = v.sku || autoSku;

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
  },

  // Lấy chi tiết 1 sản phẩm
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          variants: true
        }
      });
      if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, categoryId, variants } = req.body;

      if (!name || !categoryId) {
        return res.status(400).json({ message: 'Vui lòng điền Tên sản phẩm và Danh mục' });
      }

      const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
      if (!product) return res.status(404).json({ message: 'Không tìm thấy SP' });
      const generatedCode = product.code;

      // Format variants (chỉ xử lý các biến thể từ request)
      const mappedVariants = variants.map((v, i) => {
        let autoSku = generatedCode;
        if (variants.length > 1) {
           autoSku = `${generatedCode}-${i + 1}`;
        }
        autoSku = v.sku || autoSku;

        const attributesJson = typeof v.attributes === 'string' 
          ? { details: v.attributes } 
          : (v.attributes || { details: "Mặc định" });
          
        return {
          where: { sku: autoSku },
          create: {
            sku: autoSku,
            attributes: attributesJson,
            importPrice: parseFloat(v.importPrice) || 0,
            sellPrice: parseFloat(v.sellPrice) || 0,
            stockCount: 0,
            minStockLevel: parseInt(v.minStockLevel) || 5
          },
          update: {
            attributes: attributesJson,
            importPrice: parseFloat(v.importPrice) || 0,
            sellPrice: parseFloat(v.sellPrice) || 0,
            minStockLevel: parseInt(v.minStockLevel) || 5
          }
        };
      });

      const incomingSkus = mappedVariants.map(mv => mv.create.sku);

      const updatedProduct = await prisma.$transaction(async (tx) => {
        // Tìm variants dư thừa và xoá nếu không có dữ liệu giao dịch
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: parseInt(id) },
          include: {
            batches: true,
            orderItems: true,
            inventoryItems: true
          }
        });
        
        for (const ev of existingVariants) {
          if (!incomingSkus.includes(ev.sku)) {
            if (ev.batches.length > 0 || ev.orderItems.length > 0 || ev.inventoryItems.length > 0) {
              throw new Error(`Không thể xoá biến thể ${ev.sku} vì đã có dữ liệu giao dịch ở hệ thống`);
            }
            await tx.productVariant.delete({ where: { id: ev.id } });
          }
        }

        // Upsert list variants và Cập nhật Mẹ
        const result = await tx.product.update({
          where: { id: parseInt(id) },
          data: {
            name: name,
            description: description || null,
            categoryId: parseInt(categoryId),
            variants: {
               upsert: mappedVariants
            }
          },
          include: {
            variants: true
          }
        });
        return result;
      });

      res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product: updatedProduct });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message || 'Lỗi server khi cập nhật sản phẩm' });
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const variants = await prisma.productVariant.findMany({
        where: { productId: parseInt(id) },
        include: {
          batches: true,
          orderItems: true,
          inventoryItems: true
        }
      });

      for (let v of variants) {
        if (v.batches.length > 0 || v.orderItems.length > 0 || v.inventoryItems.length > 0) {
          return res.status(400).json({ 
            message: `Sản phẩm này chứa biến thể (SKU: ${v.sku}) đã phát sinh dữ liệu Kho/Đơn hàng. KHÔNG THỂ XÓA để bảo toàn tính nguyên vẹn dữ liệu kế toán.`
          });
        }
      }

      await prisma.$transaction(async (tx) => {
        await tx.productVariant.deleteMany({
          where: { productId: parseInt(id) }
        });
        
        await tx.product.delete({
          where: { id: parseInt(id) }
        });
      });

      res.status(200).json({ message: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm', error: error.message });
    }
  }
};

module.exports = productController;
