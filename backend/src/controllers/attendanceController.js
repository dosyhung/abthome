const prisma = require('../config/prisma');

const attendanceController = {
  // Lấy trạng thái điểm danh hôm nay của cá nhân
  getMyTodayStatus: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Tạo chuỗi ngày dạng YYYY-MM-DD theo giờ Việt Nam
      const now = new Date();
      const localString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
      const dateString = localString.split('T')[0];

      const record = await prisma.attendance.findUnique({
        where: {
          userId_dateString: {
            userId: parseInt(userId),
            dateString: dateString
          }
        }
      });

      if (record) {
        return res.status(200).json({ checkedIn: true, record });
      }
      return res.status(200).json({ checkedIn: false });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // Điểm danh (Chỉ được bấm 1 lần)
  checkIn: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const now = new Date();
      const localString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
      const dateString = localString.split('T')[0];

      // Kiểm tra trong CSDL đã có record ngày hôm nay chưa
      const existing = await prisma.attendance.findUnique({
        where: {
          userId_dateString: {
            userId: parseInt(userId),
            dateString: dateString
          }
        }
      });

      if (existing) {
        return res.status(400).json({ message: 'Bạn đã điểm danh hôm nay rồi!' });
      }

      // Lấy cấu hình cắt giờ từ Database
      const systemSetting = await prisma.systemSetting.findUnique({ where: { key: 'ATTENDANCE_LATE_TIME' } });
      const lateTimeSetting = systemSetting ? systemSetting.value : '08:30';
      
      const [settingHour, settingMinute] = lateTimeSetting.split(':').map(Number);
      const limitInMinutes = settingHour * 60 + settingMinute;

      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentInMinutes = currentHour * 60 + currentMinute;
      
      const status = currentInMinutes <= limitInMinutes ? 'PRESENT' : 'LATE';

      const newRecord = await prisma.attendance.create({
        data: {
          userId: parseInt(userId),
          dateString: dateString,
          checkInTime: now,
          status: status
        }
      });

      return res.status(200).json({ message: 'Chấm công thành công!', record: newRecord });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi máy chủ khi chấm công', error: error.message });
    }
  },

  // API dành cho Quản lý xuất danh sách theo tháng (Đã Phân Quyền)
  getReportByMonth: async (req, res) => {
    try {
      const { userId, roleId } = req.user;
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      const isAdmin = role && role.name && role.name.toUpperCase() === 'ADMIN';

      const { month, year } = req.query; // YYYY, MM
      // Mặc định nếu không truyền là lấy tháng hiện tại
      const targetYear = year ? parseInt(year) : new Date().getFullYear();
      const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
      
      const prefix = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`; // VD: "2023-10"

      // Xây dựng bộ lọc attendance theo phân quyền
      const attendanceWhere = {
        dateString: {
          startsWith: prefix
        }
      };
      if (!isAdmin) {
        attendanceWhere.userId = parseInt(userId);
      }

      const attendances = await prisma.attendance.findMany({
        where: attendanceWhere,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, avatar: true }
          }
        }
      });

      // Lấy danh sách User để phòng trường hợp chưa có ngày nào đi làm trong tháng
      // Nếu không phải Admin thì chỉ trả về chính mình
      const userWhere = isAdmin ? {} : { id: parseInt(userId) };
      const allUsers = await prisma.user.findMany({
        where: userWhere,
        select: { id: true, fullName: true, email: true, avatar: true }
      });

      return res.status(200).json({ attendances, allUsers });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi lấy báo cáo', error: error.message });
    }
  }
};

module.exports = attendanceController;
