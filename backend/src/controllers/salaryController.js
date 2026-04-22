const prisma = require('../config/prisma');

const salaryController = {
  // Lấy danh sách lương của toàn bộ nhân viên trong một tháng
  getSalaryByMonth: async (req, res) => {
    try {
      const { month, year } = req.query;
      const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
      const targetYear = year ? parseInt(year) : new Date().getFullYear();

      // Tiền tố ngày để lọc Attendance (VD: "2023-10")
      const prefix = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;

      // Lấy danh sách nhân viên
      const users = await prisma.user.findMany({
        select: { id: true, fullName: true, email: true, avatar: true, baseSalary: true }
      });

      // Lấy danh sách chấm công trong tháng
      const attendances = await prisma.attendance.findMany({
        where: {
          dateString: { startsWith: prefix }
        }
      });

      // Lấy danh sách SalaryRecord đã lưu trong tháng
      const salaryRecords = await prisma.salaryRecord.findMany({
        where: { month: targetMonth, year: targetYear }
      });

      const result = users.map(user => {
        // Nếu đã có bản ghi lưu trong DB thì ưu tiên lấy
        const savedRecord = salaryRecords.find(r => r.userId === user.id);
        
        if (savedRecord) {
          return {
            ...savedRecord,
            user
          };
        }

        // Nếu chưa có, tính toán động dựa trên chấm công và lương cơ bản hiện tại
        const userAttendances = attendances.filter(a => a.userId === user.id);
        const presentDays = userAttendances.length; // Tổng số ngày đi làm (kể cả trễ)
        const lateDays = userAttendances.filter(a => a.status === 'LATE').length;
        
        const base = parseFloat(user.baseSalary || 0);
        // Công thức: (Lương cơ bản / 26) * Số ngày làm + Thưởng - Phạt
        const calculatedSalary = (base / 26) * presentDays;

        return {
          id: `temp_${user.id}`, // ID tạm để frontend dùng làm key
          userId: user.id,
          month: targetMonth,
          year: targetYear,
          baseSalary: base,
          presentDays,
          lateDays,
          bonus: 0,
          deduction: 0,
          netSalary: calculatedSalary,
          status: 'PENDING',
          user
        };
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi máy chủ khi tính lương', error: error.message });
    }
  },

  // Cập nhật Thưởng / Phạt và (Tuỳ chọn) Lương cơ bản
  updateSalaryComponents: async (req, res) => {
    try {
      const { userId, month, year, bonus, deduction, baseSalary } = req.body;
      
      const targetMonth = parseInt(month);
      const targetYear = parseInt(year);
      const valBonus = parseFloat(bonus || 0);
      const valDeduction = parseFloat(deduction || 0);
      let valBaseSalary = undefined;
      
      if (baseSalary !== undefined) {
        valBaseSalary = parseFloat(baseSalary || 0);
        // Cập nhật mức lương cơ bản trong hồ sơ nhân viên
        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: { baseSalary: valBaseSalary }
        });
      }

      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

      // Tính lại số ngày công vì có thể chưa có record
      const prefix = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;
      const attendances = await prisma.attendance.findMany({
        where: { userId: user.id, dateString: { startsWith: prefix } }
      });
      const presentDays = attendances.length;
      const lateDays = attendances.filter(a => a.status === 'LATE').length;
      
      const base = parseFloat(user.baseSalary || 0);
      const netSalary = (base / 26) * presentDays + valBonus - valDeduction;

      const record = await prisma.salaryRecord.upsert({
        where: {
          userId_month_year: {
            userId: user.id,
            month: targetMonth,
            year: targetYear
          }
        },
        update: {
          baseSalary: base,
          bonus: valBonus,
          deduction: valDeduction,
          netSalary: netSalary
        },
        create: {
          userId: user.id,
          month: targetMonth,
          year: targetYear,
          baseSalary: base,
          presentDays,
          lateDays,
          bonus: valBonus,
          deduction: valDeduction,
          netSalary: netSalary,
          status: 'PENDING'
        }
      });

      return res.status(200).json({ message: 'Cập nhật thành công', record });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi cập nhật thành phần lương', error: error.message });
    }
  },

  // Thanh toán lương
  paySalary: async (req, res) => {
    try {
      const { userId, month, year } = req.body;
      const targetMonth = parseInt(month);
      const targetYear = parseInt(year);
      
      // Upsert để đảm bảo có bản ghi SalaryRecord trước khi thanh toán
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

      const prefix = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;
      const attendances = await prisma.attendance.findMany({
        where: { userId: user.id, dateString: { startsWith: prefix } }
      });
      const presentDays = attendances.length;
      const lateDays = attendances.filter(a => a.status === 'LATE').length;
      const base = parseFloat(user.baseSalary || 0);

      // Xem hiện tại có record không
      let record = await prisma.salaryRecord.findUnique({
        where: { userId_month_year: { userId: user.id, month: targetMonth, year: targetYear } }
      });

      if (!record) {
        const netSalary = (base / 26) * presentDays;
        record = await prisma.salaryRecord.create({
          data: {
            userId: user.id,
            month: targetMonth,
            year: targetYear,
            baseSalary: base,
            presentDays,
            lateDays,
            bonus: 0,
            deduction: 0,
            netSalary: netSalary,
            status: 'PENDING'
          }
        });
      }

      if (record.status === 'PAID') {
        return res.status(400).json({ message: 'Bảng lương này đã được thanh toán rồi' });
      }

      // Tạo phiếu Chi (EXPENSE) trong Sổ Quỹ Kế Toán
      const paymentCode = `PAY-SALARY-${user.id}-${targetMonth}-${targetYear}-${Date.now().toString().slice(-4)}`;
      
      const payment = await prisma.payment.create({
        data: {
          code: paymentCode,
          type: 'EXPENSE',
          amount: record.netSalary,
          method: 'BANK', // Có thể mặc định là BANK hoặc CASH
          note: `Thanh toán lương tháng ${targetMonth}/${targetYear} cho nhân viên ${user.fullName}`,
        }
      });

      // Cập nhật trạng thái SalaryRecord
      const updatedRecord = await prisma.salaryRecord.update({
        where: { id: record.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentId: payment.id
        }
      });

      return res.status(200).json({ message: 'Thanh toán lương thành công', record: updatedRecord, payment });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi thanh toán lương', error: error.message });
    }
  }
};

module.exports = salaryController;
