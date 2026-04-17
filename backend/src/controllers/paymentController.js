const prisma = require('../config/prisma');

const paymentController = {
  // 1. Lấy danh sách đối tác đang nợ
  getPartnersWithDebt: async (req, res) => {
    try {
      const { type } = req.query; // 'CUSTOMER' hoặc 'SUPPLIER'
      const partners = await prisma.partner.findMany({
        where: {
          type: type,
          debtBalance: { gt: 0 }
        },
        orderBy: { debtBalance: 'desc' }
      });
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 2. Lấy danh sách Đơn Hàng chưa thanh toán đủ (KHÁCH HÀNG)
  getUnpaidOrders: async (req, res) => {
    try {
      const { id } = req.params;
      const orders = await prisma.order.findMany({
        where: {
          customerId: Number(id),
          // Chỉ lấy những đơn mà unpaid amount > 0. (finalAmount - paidAmount) > 0
        }
      });
      // Filter the orders in memory because prisma decimal math in where clause is tricky
      const unpaidOrders = orders.filter(o => Number(o.finalAmount) > Number(o.paidAmount));
      res.json(unpaidOrders);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 3. Lấy danh sách Đơn Nhập chưa thanh toán đủ (NHÀ CUNG CẤP)
  getUnpaidImports: async (req, res) => {
    try {
      const { id } = req.params;
      const imports = await prisma.inventoryTransaction.findMany({
        where: {
          partnerId: Number(id),
          type: 'IMPORT',
        }
      });
      const unpaidImports = imports.filter(i => Number(i.totalAmount) > Number(i.paidAmount));
      res.json(unpaidImports);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 4. Thu tiền KHÁCH HÀNG (Dành cho 1 Order cụ thể hoặc ứng trước)
  receivePayment: async (req, res) => {
    try {
      const { partnerId, orderId, amount, method, note } = req.body;
      const payAmount = Number(amount);

      const result = await prisma.$transaction(async (tx) => {
        // 1. Tạo Phiếu Thu
        const payment = await tx.payment.create({
          data: {
            code: `REC-${Date.now()}`,
            type: 'INCOME',
            amount: payAmount,
            method: method || 'CASH',
            note: note,
            partnerId: partnerId ? Number(partnerId) : null,
            orderId: orderId ? Number(orderId) : null
          }
        });

        // 2. Trừ Nợ Khách Hàng (Nếu có chọn KH)
        if (partnerId) {
          const partner = await tx.partner.findUnique({ where: { id: Number(partnerId) }});
          if (partner) {
            await tx.partner.update({
              where: { id: Number(partnerId) },
              data: { debtBalance: Number(partner.debtBalance) - payAmount }
            });
          }
        }

        // 3. Cộng tiền đã thanh toán vào Đơn hàng (Nếu có thanh toán theo đơn)
        if (orderId) {
          const order = await tx.order.findUnique({ where: { id: Number(orderId) }});
          if (order) {
            await tx.order.update({
              where: { id: Number(orderId) },
              data: { paidAmount: Number(order.paidAmount) + payAmount }
            });
          }
        }

        return payment;
      });

      res.status(201).json({ message: 'Thu tiền thành công', data: result });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi thu tiền', error: error.message });
    }
  },

  // 5. Chi tiền NHÀ CUNG CẤP
  makePayment: async (req, res) => {
    try {
      const { partnerId, inventoryId, amount, method, note } = req.body;
      const payAmount = Number(amount);

      const result = await prisma.$transaction(async (tx) => {
        // 1. Tạo Phiếu Chi
        const payment = await tx.payment.create({
          data: {
            code: `PAY-${Date.now()}`,
            type: 'EXPENSE',
            amount: payAmount,
            method: method || 'BANK_TRANSFER',
            note: note,
            partnerId: partnerId ? Number(partnerId) : null,
            inventoryTransactionId: inventoryId ? Number(inventoryId) : null
          }
        });

        // 2. Trừ Nợ Nhà Cung cấp
        if (partnerId) {
          const partner = await tx.partner.findUnique({ where: { id: Number(partnerId) }});
          if (partner) {
            await tx.partner.update({
              where: { id: Number(partnerId) },
              data: { debtBalance: Number(partner.debtBalance) - payAmount }
            });
          }
        }

        // 3. Cộng tiền đã chi vào Đơn Nhập
        if (inventoryId) {
          const inv = await tx.inventoryTransaction.findUnique({ where: { id: Number(inventoryId) }});
          if (inv) {
            await tx.inventoryTransaction.update({
              where: { id: Number(inventoryId) },
              data: { paidAmount: Number(inv.paidAmount) + payAmount }
            });
          }
        }

        return payment;
      });

      res.status(201).json({ message: 'Chi tiền thành công', data: result });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi chi tiền', error: error.message });
    }
  },

  // 6. Xem Sổ quỹ (Lịch sử Thu / Chi toàn Cty)
  getCashbook: async (req, res) => {
    try {
      const payments = await prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          partner: { select: { name: true, type: true } },
          order: { select: { code: true } },
          inventory: { select: { code: true } }
        }
      });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 7. Xem Lịch sử thu chi của riêng 1 KH / NCC
  getPartnerPaymentHistory: async (req, res) => {
    try {
      const { id } = req.params;
      const payments = await prisma.payment.findMany({
        where: { partnerId: Number(id) },
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { code: true } },
          inventory: { select: { code: true } }
        }
      });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
};

module.exports = paymentController;
