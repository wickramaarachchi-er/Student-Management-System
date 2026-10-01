import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

try {
  const found = await db.auditLog.findMany({
    where: { description: { contains: 'password' } },
    select: { id: true, action: true, description: true, createdAt: true },
    take: 10,
  });
  console.log('Records with "password" in description:');
  for (const r of found) {
    // Mask to show context without printing actual secrets
    const desc = r.description || '';
    const idx = desc.toLowerCase().indexOf('password');
    const preview = desc.substring(Math.max(0, idx - 30), idx + 40).replace(/[\r\n]/g, ' ');
    console.log(`  Action: ${r.action}`);
    console.log(`  Context: "...${preview}..."`);
    console.log();
  }

  const foundCred = await db.auditLog.findMany({
    where: { description: { contains: 'credential' } },
    select: { id: true, action: true, description: true, createdAt: true },
    take: 5,
  });
  console.log('Records with "credential" in description:');
  for (const r of foundCred) {
    const desc = r.description || '';
    const idx = desc.toLowerCase().indexOf('credential');
    const preview = desc.substring(Math.max(0, idx - 30), idx + 40).replace(/[\r\n]/g, ' ');
    console.log(`  Action: ${r.action} | Context: "...${preview}..."`);
  }
} finally {
  await db.$disconnect();
}
