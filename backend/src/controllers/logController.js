const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await prisma.activityLog.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: { select: { name: true } }
          }
        }
      }
    });

    const total = await prisma.activityLog.count();

    res.json({
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách logs:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};
