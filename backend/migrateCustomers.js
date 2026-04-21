const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({ include: { role: true } });
  const adminUser = admins.find(u => {
    let perms = u.role.permissions;
    if (typeof perms === 'string') {
      try {
        perms = JSON.parse(perms);
      } catch (e) {
        perms = [];
      }
    }
    return perms && perms.includes('ALL_ACCESS');
  });

  if (adminUser) {
    console.log('Found admin:', adminUser.id);
    const result = await prisma.partner.updateMany({
      where: { type: 'CUSTOMER', assignedToId: null },
      data: { assignedToId: adminUser.id }
    });
    console.log('Assigned existing customers to admin. Count:', result.count);
  } else {
    console.log('No admin found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
