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

      const currentImports = await prisma.inventoryTransaction.findMany({
        where: { createdAt: { gte: startOfCurrent, lte: endOfCurrent }, type: 'IMPORT' }
      });
      const currentImportsTotal = currentImports.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);

      const currentExpenses = await prisma.payment.findMany({
        where: { createdAt: { gte: startOfCurrent, lte: endOfCurrent }, type: 'EXPENSE', inventoryTransactionId: null }
      });
      const currentExpensesTotal = currentExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

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
      const totalExpenseCurrent = currentImportsTotal + currentExpensesTotal;

      let P_BUCKETS = 1;
      let chartLabels = [];
      
      if (timeFilter === 'TODAY') {
        P_BUCKETS = 24;
        for (let i = 0; i < 24; i++) chartLabels.push(`${i}h`);
      } else if (timeFilter === 'WEEK') {
        P_BUCKETS = 7;
        chartLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      } else {
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        P_BUCKETS = lastDay;
        for (let i = 1; i <= lastDay; i++) chartLabels.push(`${i}`);
      }

      let chartOrders = Array(P_BUCKETS).fill(0);
      let chartRevenue = Array(P_BUCKETS).fill(0);
      let chartProfit = Array(P_BUCKETS).fill(0);
      let chartExpense = Array(P_BUCKETS).fill(0);

      const getSemanticBucketIndex = (date) => {
        if (timeFilter === 'TODAY') {
          return date.getHours();
        } else if (timeFilter === 'WEEK') {
          let d = date.getDay(); // 0 = Sun, 1 = Mon
          return d === 0 ? 6 : d - 1; 
        } else {
          return date.getDate() - 1;
        }
      };

      currentOrders.forEach(order => {
        const idx = getSemanticBucketIndex(new Date(order.createdAt));
        if (idx >= 0 && idx < P_BUCKETS) {
        const rev = Number(order.finalAmount || 0);
        let cogs = 0;
        order.items.forEach(item => {
          let importPrice = item.batch?.importPrice ? Number(item.batch.importPrice) : (item.variant?.importPrice ? Number(item.variant.importPrice) : 0);
          cogs += importPrice * item.quantity;
        });

          chartOrders[idx] += 1;
          chartRevenue[idx] += rev;
          chartProfit[idx] += (rev - cogs);
        }
      });

      currentImports.forEach(imp => {
        const idx = getSemanticBucketIndex(new Date(imp.createdAt));
        if (idx >= 0 && idx < P_BUCKETS) chartExpense[idx] += Number(imp.totalAmount || 0);
      });

      currentExpenses.forEach(exp => {
        const idx = getSemanticBucketIndex(new Date(exp.createdAt));
        if (idx >= 0 && idx < P_BUCKETS) chartExpense[idx] += Number(exp.amount || 0);
      });

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
        },
        charts: {
          labels: chartLabels,
          orders: chartOrders,
          revenue: chartRevenue,
          profit: chartProfit,
          expense: chartExpense
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
  },

  getWeeklySales: async (req, res) => {
    try {
      const days = [];
      const now = new Date();
      now.setHours(23, 59, 59, 999);

      const weekdays = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const title = i === 0 ? 'Hôm nay' : weekdays[d.getDay()];
        days.push({
          dateStr,
          title,
          revenue: 0,
          profit: 0,
          orders: 0
        });
      }

      const startOfPeriod = new Date();
      startOfPeriod.setDate(startOfPeriod.getDate() - 6);
      startOfPeriod.setHours(0, 0, 0, 0);

      const allOrders = await prisma.order.findMany({
        where: {
          createdAt: { gte: startOfPeriod, lte: now }
        },
        include: {
          items: {
            include: { batch: true, variant: { include: { product: true } } }
          }
        }
      });

      const ordersList = allOrders.filter(o => o.status !== 'CANCELLED');

      ordersList.forEach(order => {
        const d = new Date(order.createdAt);
        const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const targetDay = days.find(day => day.dateStr === dateStr);
        if (targetDay) {
          const rev = Number(order.finalAmount || 0);
          
          let cogs = 0;
          if (order.items) {
            order.items.forEach(item => {
              const importPrice = item.batch?.importPrice ? Number(item.batch.importPrice) : (item.variant?.importPrice ? Number(item.variant.importPrice) : 0);
              cogs += importPrice * item.quantity;
            });
          }
          
          targetDay.revenue += rev;
          targetDay.profit += (rev - cogs);
          targetDay.orders += 1;
        }
      });

      // Thống kê Đại lý mới & Quay lại trong tuần (chỉ tính có phát sinh đơn)
      const customerIdsInPeriod = [...new Set(ordersList.map(o => o.customerId))];
      let newAgents = 0;
      let returningAgents = 0;

      for (const cid of customerIdsInPeriod) {
        const pastOrdersCount = await prisma.order.count({
          where: {
            customerId: cid,
            createdAt: { lt: startOfPeriod },
            status: { not: 'CANCELLED' }
          }
        });
        if (pastOrdersCount === 0) {
          newAgents++;
        } else {
          returningAgents++;
        }
      }

      const totalOrdersCountPeriod = allOrders.length;
      const validOrdersCount = ordersList.length;
      const conversionRate = totalOrdersCountPeriod === 0 ? 0 : ((validOrdersCount / totalOrdersCountPeriod) * 100).toFixed(1);

      // Top 5 Products by Revenue
      const productRevenueMap = {};
      let totalValidRevenueInPeriod = 0;

      ordersList.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            const productName = item.variant?.product?.name || `Sản phẩm ${item.variant?.productId || 'N/A'}`;
            const itemRev = Number(item.price) * item.quantity;
            totalValidRevenueInPeriod += itemRev;
            if (!productRevenueMap[productName]) {
              productRevenueMap[productName] = 0;
            }
            productRevenueMap[productName] += itemRev;
          });
        }
      });

      const colors = ['success', 'info', 'warning', 'danger', 'primary'];
      
      const topProducts = Object.entries(productRevenueMap)
        .map(([title, revenue]) => ({
          title,
          revenue,
          percent: totalValidRevenueInPeriod === 0 ? 0 : Number(((revenue / totalValidRevenueInPeriod) * 100).toFixed(1))
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p, idx) => ({ ...p, color: colors[idx % colors.length] }));

      res.status(200).json({ 
        days: days, 
        newAgents, 
        returningAgents,
        totalOrdersCount: totalOrdersCountPeriod,
        conversionRate: conversionRate,
        topProducts: topProducts
      });
    } catch (e) {
      console.error("Lỗi getWeeklySales:", e);
      res.status(500).json({ message: 'Lỗi lấy dữ liệu bán hàng 7 ngày' });
    }
  },

  getLeaderboard: async (req, res) => {
    try {
      const now = new Date();
      // Lấy từ đầu tháng đến hiện tại
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          },
          status: { not: 'CANCELLED' }
        },
        include: {
          user: true
        }
      });

      const userStats = {};

      orders.forEach(order => {
        const userId = order.userId;
        if (!userId) return;

        if (!userStats[userId]) {
          userStats[userId] = {
            id: userId,
            name: order.user ? order.user.fullName : 'N/A',
            avatar: order.user ? order.user.avatar : null,
            totalRevenue: 0,
            orderCount: 0
          };
        }

        userStats[userId].totalRevenue += Number(order.finalAmount || 0);
        userStats[userId].orderCount += 1;
      });

      const leaderboard = Object.values(userStats).map(user => {
        let classification = { label: 'Cố gắng', color: 'danger' };
        if (user.totalRevenue >= 400000000) {
          classification = { label: 'Xuất Sắc', color: 'success' };
        } else if (user.totalRevenue >= 300000000) {
          classification = { label: 'Giỏi', color: 'primary' };
        } else if (user.totalRevenue >= 200000000) {
          classification = { label: 'Đạt', color: 'warning' };
        }

        return {
          ...user,
          classification
        };
      });

      leaderboard.sort((a, b) => b.totalRevenue - a.totalRevenue);

      // Mặc định trả về top 10 hoặc tất cả
      res.status(200).json(leaderboard);
    } catch (error) {
      console.error("Lỗi getLeaderboard:", error);
      res.status(500).json({ message: 'Lỗi lấy dữ liệu bảng xếp hạng' });
    }
  },

  getLowStockProducts: async (req, res) => {
    try {
      const takeLimit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      
      const queryOptions = {
        where: {
          stockCount: {
            lt: 50
          }
        },
        include: {
          product: true
        },
        orderBy: {
          stockCount: 'asc'
        }
      };

      if (takeLimit && !isNaN(takeLimit)) {
        queryOptions.take = takeLimit;
      }

      const lowStockVariants = await prisma.productVariant.findMany(queryOptions);

      const result = lowStockVariants.map(v => ({
        id: v.id,
        sku: v.sku,
        productName: v.product ? v.product.name : 'Unknown Product',
        stockCount: v.stockCount
      }));

      res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi getLowStockProducts:", error);
      res.status(500).json({ message: 'Lỗi lấy dữ liệu cảnh báo tồn kho' });
    }
  }
};

module.exports = dashboardController;
