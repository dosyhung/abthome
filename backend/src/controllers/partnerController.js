const prisma = require('../config/prisma');

const partnerController = {
  // Lấy danh sách khách hàng tự do hoặc theo phân loại
  getPartners: async (req, res) => {
    try {
      const { type } = req.query;
      const filter = type ? { type } : {};
      
      const partners = await prisma.partner.findMany({
        where: filter,
        orderBy: { name: 'asc' }
      });
      
      // Thêm nợ cũ vào nếu cần thiết, nhưng getPartners này đang được xài chung
      res.status(200).json(partners);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tải đối tác', error: error.message });
    }
  },

  // Tạo đối tác mới (Mặc định cho SUPPLIER trong context này)
  createPartner: async (req, res) => {
    try {
      const { name, phone, address, taxCode, type } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ message: 'Tên và số điện thoại là bắt buộc' });
      }

      const existingPhone = await prisma.partner.findUnique({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ message: 'Số điện thoại này đã được sử dụng' });
      }

      const partner = await prisma.partner.create({
        data: {
          name,
          phone,
          address: address || null,
          taxCode: taxCode || null,
          type: type || 'SUPPLIER',
          debtBalance: 0
        }
      });
      res.status(201).json({ message: 'Tạo nhà cung cấp thành công', data: partner });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
  },

  // Sửa thông tin đối tác
  updatePartner: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone, address, taxCode } = req.body;

      // Check phone trùng nếu phone bị thay đổi
      const existing = await prisma.partner.findUnique({ where: { id: parseInt(id) } });
      if (!existing) {
        return res.status(404).json({ message: 'Không tìm thấy đối tác' });
      }

      if (phone !== existing.phone) {
        const phoneTaken = await prisma.partner.findUnique({ where: { phone } });
        if (phoneTaken) {
          return res.status(400).json({ message: 'Số điện thoại này đã thuộc người khác' });
        }
      }

      const updated = await prisma.partner.update({
        where: { id: parseInt(id) },
        data: { name, phone, address, taxCode }
      });

      res.status(200).json({ message: 'Cập nhật thành công', data: updated });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
  }
};

module.exports = partnerController;
