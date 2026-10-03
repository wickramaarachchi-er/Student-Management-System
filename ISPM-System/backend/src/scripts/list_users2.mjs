import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
try {
  const users = await db.user.findMany({
    select: { email: true, role: true, isActive: true, firstName: true, lastName: true },
    orderBy: { role: 'asc' }
  });
  console.log(JSON.stringify(users, null, 2));
} finally {
  await db.$disconnect();
}
