const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // 1. Kiểm tra đầu vào
      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp cả email và mật khẩu' });
      }

      // 2. Tìm user theo email (join kèm role)
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          role: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại' });
      }

      // ==========================================
      // ĐOẠN CODE ĐÃ ĐƯỢC CHỈNH SỬA & GẮN CAMERA
      // ==========================================

      // Ép kiểu an toàn và xóa dấu cách thừa (nếu có)
      const safePassword = String(password).trim();

      const isMatch = await bcrypt.compare(safePassword, user.password);

      // IN RA TERMINAL BACKEND ĐỂ THEO DÕI
      console.log("\n=== THÔNG TIN DEBUG ĐĂNG NHẬP ===");
      console.log("Pass Frontend gửi lên :", `"${safePassword}"`, "(Độ dài:", safePassword.length, ")");
      console.log("Pass Database đang lưu:", `"${user.password}"`, "(Độ dài:", user.password.length, ")");
      console.log("Kết quả khớp mật khẩu :", isMatch);
      console.log("=================================\n");

      if (!isMatch) {
        return res.status(401).json({ message: 'Mật khẩu không chính xác' });
      }
      // ==========================================

      // 4. Kiểm tra trạng thái hoạt động (isActive)
      if (!user.isActive) {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' });
      }

      // 5. Thành công -> Sinh token
      const token = generateToken(user.id, user.roleId);

      // Trả về thông tin (Ẩn password)
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        message: 'Đăng nhập thành công',
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: error.message });
    }
  }
};

module.exports = authController;