const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// 1. Kiểm tra Token từ Header
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không tìm thấy Token hoặc định dạng sai' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'default_secret';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { userId, roleId, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// 2. Kiểm tra Phân quyền (Permission)
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const { roleId } = req.user;
      if (!roleId) {
        return res.status(403).json({ message: 'Không tìm thấy thông tin quyền hạn của User' });
      }

      // Tìm role trong DB
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        return res.status(403).json({ message: 'Role không tồn tại' });
      }

      // Giả dụ permissions được lưu thành mảng JSON ["VIEW_DASHBOARD", "CREATE_ORDER", ...]
      const permissions = role.permissions || [];
      
      // Nếu là chuỗi JSON do DB cũ (an toàn)
      let parsedPermissions = [];
      if (typeof permissions === 'string') {
        parsedPermissions = JSON.parse(permissions);
      } else if (Array.isArray(permissions)) {
        parsedPermissions = permissions;
      }

      // Nếu user thuộc role SuperAdmin có chuỗi ALL_ACCESS, bỏ qua mọi rào cản
      if (parsedPermissions.includes('ALL_ACCESS')) {
        return next();
      }

      if (!parsedPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Tài khoản không đủ thẩm quyền (Forbidden)' });
      }

      // Hợp lệ, đi tiếp
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi server khi kiểm tra quyền', error: error.message });
    }
  };
};

module.exports = {
  verifyToken,
  checkPermission
};
