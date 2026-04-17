const prisma = require('../config/prisma');

const categoryController = {
  // Lấy toàn bộ danh mục
  getAllCategories: async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { id: 'desc' }
      });
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy dữ liệu danh mục', error: error.message });
    }
  },

  // Tạo mới danh mục
  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Tên danh mục không được để trống' });
      }

      const newCategory = await prisma.category.create({
        data: {
          name,
          description: description || null
        }
      });
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo danh mục', error: error.message });
    }
  },

  // Cập nhật danh mục
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Tên danh mục không được để trống' });
      }

      const updatedCategory = await prisma.category.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description: description || null
        }
      });
      res.status(200).json(updatedCategory);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      res.status(500).json({ message: 'Lỗi khi cập nhật danh mục', error: error.message });
    }
  }
};

module.exports = categoryController;
