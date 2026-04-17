const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const profileController = {
  // Cập nhật thông tin cá nhân
  updateMyProfile: async (req, res) => {
    try {
      const { userId } = req.user; // Trích xuất từ token qua verifyToken middleware
      const { fullName, phone, avatar } = req.body;

      // Không cần thiết phải check role vì user chỉ sửa thông tin của chính mình
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          fullName: fullName !== undefined ? fullName : undefined,
          phone: phone !== undefined ? phone : undefined,
          avatar: avatar !== undefined ? avatar : undefined,
        }
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.status(200).json({ message: 'Cập nhật hồ sơ thành công', data: userWithoutPassword });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật hồ sơ', error: error.message });
    }
  },

  // Đổi mật khẩu cá nhân
  changeMyPassword: async (req, res) => {
    try {
      const { userId } = req.user;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp cả mật khẩu hiện tại và mật khẩu mới' });
      }

      // 1. Tìm user hiện tại
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại' });
      }

      // 2. Kiểm tra mật khẩu cũ
      const isMatch = await bcrypt.compare(String(currentPassword).trim(), user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
      }

      // 3. Hash mật khẩu mới và lưu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(String(newPassword).trim(), salt);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      res.status(200).json({ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại!' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi đổi mật khẩu', error: error.message });
    }
  }
};

module.exports = profileController;
