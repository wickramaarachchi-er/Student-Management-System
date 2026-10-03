import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.auditLog.findMany({
    where: {
      action: {
        in: ['COMPLIANCE_REPORT_VIEWED', 'COMPLIANCE_EMPLOYEE_VIEWED']
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log(`Found ${logs.length} compliance audit log entries:`);
  logs.forEach((log) => {
    console.log(`- Action: ${log.action} | User: ${log.userId} | Target: ${log.targetId || 'N/A'} | Desc: ${log.details}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
