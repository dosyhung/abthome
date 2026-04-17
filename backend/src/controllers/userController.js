const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const userController = {
  // 0. Lấy danh sách Roles
  getRoles: async (req, res) => {
    try {
      const roles = await prisma.role.findMany();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi lấy role', error: error.message });
    }
  },

  // 1. Lấy danh sách users (Không trả về pass)
  getAllUsers: async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        include: {
          role: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Loại bỏ trường password khỏi từng user
      const usersWithoutPassword = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });

      res.status(200).json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi lấy danh sách nhân viên', error: error.message });
    }
  },

  // 2. Tạo User mới
  createUser: async (req, res) => {
    try {
      const { email, password, fullName, phone, roleId } = req.body;

      if (!email || !password || !fullName || !roleId) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường bắt buộc' });
      }

      // Kiểm tra trùng lặp email
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email này đã được sử dụng' });
      }

      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          phone,
          roleId: Number(roleId),
          isActive: true
        }
      });

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ message: 'Tạo tài khoản thành công', data: userWithoutPassword });

    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi tạo tài khoản', error: error.message });
    }
  },

  // 3. Cập nhật thông tin User
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, phone, roleId, isActive } = req.body;

      const userExists = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!userExists) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          fullName: fullName !== undefined ? fullName : userExists.fullName,
          phone: phone !== undefined ? phone : userExists.phone,
          roleId: roleId !== undefined ? Number(roleId) : userExists.roleId,
          isActive: isActive !== undefined ? isActive : userExists.isActive
        }
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.status(200).json({ message: 'Cập nhật thành công', data: userWithoutPassword });

    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi cập nhật tài khoản', error: error.message });
    }
  },

  // 4. Reset Mật khẩu về mặc định
  resetPassword: async (req, res) => {
    try {
      const { id } = req.params;

      const userExists = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!userExists) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      const defaultPassword = '123456';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      await prisma.user.update({
        where: { id: Number(id) },
        data: {
          password: hashedPassword
        }
      });

      res.status(200).json({ message: `Đặt lại mật khẩu thành công (Mật khẩu mặc định: ${defaultPassword})` });

    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi reset mật khẩu', error: error.message });
    }
  }
};

module.exports = userController;
