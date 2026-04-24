const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware để tự động ghi log các thao tác (POST, PUT, PATCH, DELETE) của người dùng.
 * Sẽ chặn (intercept) response để lấy status code và sau đó ghi log vào Database.
 */
const auditMiddleware = (req, res, next) => {
  // Chỉ log các request làm thay đổi dữ liệu
  const loggableMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (loggableMethods.includes(req.method)) {
    // Lưu lại hàm res.send gốc
    const originalSend = res.send;

    // Chèn hàm send tùy chỉnh để bắt thời điểm kết thúc request
    res.send = function (body) {
      // Phải gọi hàm gốc để trả response về cho client
      originalSend.call(this, body);

      // Nếu thành công (status 2xx) thì mới log
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Tránh log request login để bảo mật mật khẩu, hoặc có thể log nhưng không lưu details
        let actionStr = `${req.method} ${req.baseUrl || ''}${req.path}`;
        
        let detailsStr = '';
        if (req.method !== 'DELETE') {
           // Che giấu mật khẩu nếu có
           const safeBody = { ...req.body };
           if (safeBody.password) safeBody.password = '***';
           detailsStr = JSON.stringify(safeBody).substring(0, 500); // Lưu tối đa 500 ký tự
        }

        // Lấy IP
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Lưu vào DB (Không await để không chặn luồng chính)
        prisma.activityLog.create({
          data: {
            userId: req.user ? (req.user.userId || req.user.id) : null, // req.user được gán từ authMiddleware
            action: actionStr,
            resource: req.baseUrl || req.path,
            details: detailsStr,
            ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
          }
        }).catch(err => {
          console.error("Lỗi khi ghi Audit Log:", err);
        });
      }
    };
  }
  
  next();
};

module.exports = auditMiddleware;
