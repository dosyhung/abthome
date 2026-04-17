const prisma = require('../config/prisma');

const dashboardController = {
  getSummary: async (req, res) => {
    try {
      const now = new Date();
      const timeFilter = req.query.timeFilter || 'TODAY';
      
      let startOfCurrent, endOfCurrent, startOfPrevious, endOfPrevious;

      if (timeFilter === 'TODAY') {
        startOfCurrent = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endOfCurrent = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        
        startOfPrevious = new Date(startOfCurrent);
        startOfPrevious.setDate(startOfPrevious.getDate() - 1);
        
        endOfPrevious = new Date(startOfPrevious);
        endOfPrevious.setHours(23, 59, 59);
      } else if (timeFilter === 'WEEK') {
        const dayOfWeek = now.getDay();
        const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfCurrent = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0);
        endOfCurrent = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        startOfPrevious = new Date(startOfCurrent);
        startOfPrevious.setDate(startOfPrevious.getDate() - 7);
        
        endOfPrevious = new Date(startOfCurrent);
        endOfPrevious.setTime(endOfPrevious.getTime() - 1);
      } else {
        // Mặc định là MONTH
        startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
        endOfCurrent = now;

        startOfPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endOfPrevious = new Date(startOfCurrent);
        endOfPrevious.setTime(endOfPrevious.getTime() - 1);
      }

      // ---------------------------------------------
      // 1. DATA KỲ HIỆN TẠI (CURRENT)
      // ---------------------------------------------
      const currentOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: startOfCurrent, lte: endOfCurrent },
          status: { not: 'CANCELLED' }
        },
        include: {
          items: {
            include: { batch: true, variant: true }
          }
        }
      });

      const currentImports = await prisma.inventoryTransaction.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startOfCurrent, lte: endOfCurrent }, type: 'IMPORT' }
      });

      const currentExpenses = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: startOfCurrent, lte: endOfCurrent }, type: 'EXPENSE', inventoryTransactionId: null }
      });

      let totalRevenueCurrent = 0;
      let totalProfitCurrent = 0;

      currentOrders.forEach(order => {
        const rev = Number(order.finalAmount || 0);
        totalRevenueCurrent += rev;
        
        let cogs = 0; // Giá vốn hàng bán (Cost of goods sold)
        order.items.forEach(item => {
          let importPrice = 0;
          if (item.batch && item.batch.importPrice) {
            importPrice = Number(item.batch.importPrice);
          } else if (item.variant && item.variant.importPrice) {
            importPrice = Number(item.variant.importPrice);
          }
          cogs += importPrice * item.quantity;
        });

        totalProfitCurrent += (rev - cogs);
      });

      const totalOrdersCurrent = currentOrders.length;
      const totalExpenseCurrent = Number(currentImports._sum.totalAmount || 0) + Number(currentExpenses._sum.amount || 0);

      // ---------------------------------------------
      // 2. DATA KỲ TRƯỚC (PREVIOUS)
      // ---------------------------------------------
      const previousOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: startOfPrevious, lte: endOfPrevious },
          status: { not: 'CANCELLED' }
        },
        include: {
          items: {
            include: { batch: true, variant: true }
          }
        }
      });

      const previousImports = await prisma.inventoryTransaction.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startOfPrevious, lte: endOfPrevious }, type: 'IMPORT' }
      });

      const previousExpenses = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: startOfPrevious, lte: endOfPrevious }, type: 'EXPENSE', inventoryTransactionId: null }
      });

      let totalRevenuePrevious = 0;
      let totalProfitPrevious = 0;

      previousOrders.forEach(order => {
        const rev = Number(order.finalAmount || 0);
        totalRevenuePrevious += rev;
        
        let cogs = 0;
        order.items.forEach(item => {
          let importPrice = 0;
          if (item.batch && item.batch.importPrice) {
            importPrice = Number(item.batch.importPrice);
          } else if (item.variant && item.variant.importPrice) {
            importPrice = Number(item.variant.importPrice);
          }
          cogs += importPrice * item.quantity;
        });

        totalProfitPrevious += (rev - cogs);
      });

      const totalOrdersPrevious = previousOrders.length;
      const totalExpensePrevious = Number(previousImports._sum.totalAmount || 0) + Number(previousExpenses._sum.amount || 0);

      // ---------------------------------------------
      // 3. TÍNH TỶ LỆ % (RATE)
      // ---------------------------------------------
      const calculateRate = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return (((current - previous) / previous) * 100).toFixed(1);
      };

      res.status(200).json({
        orders: {
          value: totalOrdersCurrent,
          rate: calculateRate(totalOrdersCurrent, totalOrdersPrevious)
        },
        revenue: {
          value: totalRevenueCurrent,
          rate: calculateRate(totalRevenueCurrent, totalRevenuePrevious)
        },
        profit: {
          value: totalProfitCurrent,
          rate: calculateRate(totalProfitCurrent, totalProfitPrevious)
        },
        expense: {
          value: totalExpenseCurrent,
          rate: calculateRate(totalExpenseCurrent, totalExpensePrevious)
        }
      });

    } catch (error) {
      console.error("Dashboard Summary Error:", error);
      res.status(500).json({ message: 'Lỗi khi tải bảng tóm tắt Dashboard' });
    }
  },

  getChartData: async (req, res) => {
    try {
      const timeFilter = req.query.timeFilter || 'Month'; // 'Day', 'Month', 'Year'
      const now = new Date();
      let startOfCurrent, endOfCurrent;
      let labels = [];
      let dataGroups = {};

      if (timeFilter === 'Day') {
        startOfCurrent = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endOfCurrent = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        for (let i = 0; i <= 23; i++) {
          labels.push(`${i}h`);
          dataGroups[i] = { revenue: 0, profit: 0, orders: 0 };
        }
      } else if (timeFilter === 'Year') {
        startOfCurrent = new Date(now.getFullYear(), 0, 1);
        endOfCurrent = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        for (let i = 0; i <= 11; i++) {
          labels.push(`Tháng ${i+1}`);
          dataGroups[i] = { revenue: 0, profit: 0, orders: 0 };
        }
      } else { // 'Month'
        startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        endOfCurrent = new Date(now.getFullYear(), now.getMonth(), lastDay, 23, 59, 59);
        for (let i = 1; i <= lastDay; i++) {
          labels.push(`Ngày ${i}`);
          dataGroups[i] = { revenue: 0, profit: 0, orders: 0 };
        }
      }

      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: startOfCurrent, lte: endOfCurrent }, status: { not: 'CANCELLED' } },
        include: { items: { include: { batch: true, variant: true } } }
      });

      orders.forEach(order => {
        let groupKey;
        const d = new Date(order.createdAt);
        if (timeFilter === 'Day') groupKey = d.getHours();
        else if (timeFilter === 'Year') groupKey = d.getMonth();
        else groupKey = d.getDate(); // Month

        const rev = Number(order.finalAmount || 0);
        let cogs = 0;
        order.items.forEach(item => {
          let importPrice = item.batch?.importPrice ? Number(item.batch.importPrice) : (item.variant?.importPrice ? Number(item.variant.importPrice) : 0);
          cogs += importPrice * item.quantity;
        });
        const profit = rev - cogs;

        if (dataGroups[groupKey]) {
          dataGroups[groupKey].revenue += rev;
          dataGroups[groupKey].profit += profit;
          dataGroups[groupKey].orders += 1;
        }
      });

      const revenues = Object.values(dataGroups).map(g => g.revenue);
      const profits = Object.values(dataGroups).map(g => g.profit);
      const ordersCount = Object.values(dataGroups).map(g => g.orders);

      res.status(200).json({ labels, datasets: { revenues, profits, ordersCount } });
    } catch (e) {
      console.error("Lỗi getChartData:", e);
      res.status(500).json({ message: 'Lỗi lấy dữ liệu biểu đồ' });
    }
  }
};

module.exports = dashboardController;
