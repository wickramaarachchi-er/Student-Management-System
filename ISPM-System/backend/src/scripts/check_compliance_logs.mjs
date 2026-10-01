import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.auditLog.findMany({
    where: {
      action: {
        in: ['HELPDESK_TICKET_CREATED', 'HELPDESK_RESPONSE_ADDED', 'HELPDESK_STATUS_CHANGED']
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`Found ${logs.length} compliance audit log entries:`);
  logs.forEach((log) => {
    console.log(`- [${log.createdAt.toISOString()}] Action: ${log.action} | User: ${log.userId} | Entity: ${log.entityType}/${log.entityId || 'N/A'} | Desc: ${log.description}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
