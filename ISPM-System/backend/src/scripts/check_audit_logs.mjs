import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      action: {
        in: [
          'QUIZ_CREATED',
          'QUIZ_UPDATED',
          'QUIZ_QUESTION_CREATED',
          'QUIZ_QUESTION_UPDATED',
          'QUIZ_QUESTION_DELETED',
          'QUIZ_STARTED',
          'QUIZ_SUBMITTED'
        ]
      }
    },
      orderBy: { createdAt: 'desc' },
    take: 15
  });

  console.log(`--- AUDIT LOGS FOR QUIZ EVENTS (${auditLogs.length} found) ---`);
  auditLogs.forEach(log => {
    console.log(`[${log.createdAt.toISOString()}] User: ${log.userEmail} (${log.userId}) | Action: ${log.action} | Entity: ${log.entityType}/${log.entityId}`);
    console.log(`   Description: ${log.description}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
