const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const roles = await prisma.role.findMany();
    console.log("Roles:", JSON.stringify(roles, null, 2));

    const users = await prisma.user.findMany({ include: { role: true } });
    console.log("\nUsers:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
