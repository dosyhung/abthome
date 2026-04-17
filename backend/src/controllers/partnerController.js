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
      
      res.status(200).json(partners);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tải đối tác', error: error.message });
    }
  }
};

module.exports = partnerController;
