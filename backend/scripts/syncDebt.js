const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sync() {
  const partners = await prisma.partner.findMany();
  for (const partner of partners) {
    if (partner.type === 'SUPPLIER') {
      const imports = await prisma.inventoryTransaction.findMany({
        where: { partnerId: partner.id, type: 'IMPORT' }
      });
      const debt = imports.reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0);
      await prisma.partner.update({
        where: { id: partner.id },
        data: { debtBalance: debt }
      });
      console.log(`Updated supplier ${partner.name} debt to ${debt}`);
    } else {
      const orders = await prisma.order.findMany({
        where: { customerId: partner.id }
      });
      const debt = orders.reduce((sum, order) => sum + (Number(order.finalAmount) - Number(order.paidAmount)), 0);
      await prisma.partner.update({
        where: { id: partner.id },
        data: { debtBalance: debt }
      });
      console.log(`Updated customer ${partner.name} debt to ${debt}`);
    }
  }
}

sync().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
