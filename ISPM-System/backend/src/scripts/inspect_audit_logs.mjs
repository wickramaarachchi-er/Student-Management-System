/**
 * Inspect audit log records: coverage, counts, sensitive data scan.
 */
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

try {
  const total = await db.auditLog.count();
  console.log(`\n=== AUDIT LOG INSPECTION ===`);
  console.log(`Total records: ${total}`);

  // Get distinct actions
  const actions = await db.$queryRaw`SELECT DISTINCT action, COUNT(*) as cnt FROM audit_logs GROUP BY action ORDER BY cnt DESC`;
  console.log(`\n--- Distinct Actions (${actions.length}) ---`);
  for (const r of actions) {
    console.log(`  ${r.action}: ${r.cnt}`);
  }

  // Get distinct entityTypes
  const entityTypes = await db.$queryRaw`SELECT DISTINCT entityType, COUNT(*) as cnt FROM audit_logs WHERE entityType IS NOT NULL GROUP BY entityType ORDER BY cnt DESC`;
  console.log(`\n--- Distinct Entity Types ---`);
  for (const r of entityTypes) {
    console.log(`  ${r.entityType}: ${r.cnt}`);
  }

  // Check for sensitive data in descriptions
  console.log(`\n--- Sensitive Data Scan ---`);
  const sensitivePatterns = ['password', 'hash', 'bearer', 'token', 'secret', 'authorization', 'jwt', 'credential'];
  for (const pattern of sensitivePatterns) {
    const found = await db.auditLog.findMany({
      where: {
        OR: [
          { description: { contains: pattern } },
          { userEmail: { contains: pattern } },
          { action: { contains: pattern } },
        ]
      },
      select: { id: true, action: true, createdAt: true },
      take: 5,
    });
    if (found.length > 0) {
      console.log(`  WARNING: Pattern "${pattern}" found in ${found.length} record(s)! Actions: ${found.map(f => f.action).join(', ')}`);
    } else {
      console.log(`  OK: Pattern "${pattern}" not found`);
    }
  }

  // Get 5 most recent records (no sensitive fields)
  console.log(`\n--- 5 Most Recent Records ---`);
  const recent = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      userId: true,
      userEmail: true,
      action: true,
      entityType: true,
      entityId: true,
      description: true,
      ipAddress: true,
      createdAt: true,
    }
  });
  for (const r of recent) {
    console.log(`  [${r.createdAt.toISOString()}] ${r.action} | ${r.entityType || '-'} | ${r.userEmail || r.userId || 'anon'} | ${(r.description || '').substring(0, 80)}`);
  }

} finally {
  await db.$disconnect();
}
