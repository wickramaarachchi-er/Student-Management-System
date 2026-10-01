import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'employee@ispm.local' } });
  const progresses = await prisma.trainingProgress.findMany({
    where: { userId: user.id },
    include: { trainingModule: true }
  });

  console.log('Employee Progresses:');
  progresses.forEach(p => {
    console.log(`- Module: "${p.trainingModule.title}" | Status: ${p.status} | CompletedAt: ${p.completedAt}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
