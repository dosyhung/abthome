const prisma = require('../config/prisma');

// [GET] /api/settings
// Lấy toàn bộ settings dạng Object
const getSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // Chuyển mảng [{key: "a", value: "b"}] thành object { a: "b" }
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.status(200).json(settingsObj);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy cài đặt', error: error.message });
  }
};

// [PUT] /api/settings
// Cập nhật nhiều settings cùng lúc
const updateSettings = async (req, res) => {
  try {
    const newSettings = req.body; // { key1: "value1", key2: "value2" }

    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ message: 'Dữ liệu đầu vào không hợp lệ' });
    }

    // Upsert từng setting
    const updatePromises = Object.keys(newSettings).map(key => {
      // Bỏ qua nếu giá trị bị undefined
      if (newSettings[key] === undefined) return Promise.resolve();
      
      const value = String(newSettings[key]); // Đảm bảo lưu chuỗi
      return prisma.systemSetting.upsert({
        where: { key: key },
        update: { value: value },
        create: { key: key, value: value }
      });
    });

    await Promise.all(updatePromises);

    res.status(200).json({ message: 'Lưu cài đặt thành công' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật cài đặt', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
