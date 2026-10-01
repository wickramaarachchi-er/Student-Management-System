/**
 * ISPM System – Development Seed Script
 * ============================================================
 * Creates one user per system role for local development.
 *
 * Development-only password (ALL accounts): Ispm@Dev2024!
 *
 * NEVER use these credentials in production.
 * NEVER commit real credentials to version control.
 * ============================================================
 *
 * Usage:
 *   npm run db:seed
 *
 * Requires a working DATABASE_URL in backend/.env
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────
// Development-only password – documented here intentionally.
// Change this before deploying to any shared/production env.
// ────────────────────────────────────────────────────────────
const DEV_PASSWORD = "Ispm@Dev2024!";
const SALT_ROUNDS = 12;

const seedUsers = [
  {
    firstName: "System",
    lastName: "Administrator",
    email: "admin@ispm.local",
    role: "SYSTEM_ADMIN",
    department: "IT",
    phone: "+94 71 000 0001",
  },
  {
    firstName: "Compliance",
    lastName: "Officer",
    email: "compliance@ispm.local",
    role: "COMPLIANCE_OFFICER",
    department: "Compliance",
    phone: "+94 71 000 0002",
  },
  {
    firstName: "Training",
    lastName: "Administrator",
    email: "training@ispm.local",
    role: "TRAINING_ADMIN",
    department: "HR",
    phone: "+94 71 000 0003",
  },
  {
    firstName: "Jane",
    lastName: "Employee",
    email: "employee@ispm.local",
    role: "EMPLOYEE",
    department: "Finance",
    phone: "+94 71 000 0004",
  },
];

async function main() {
  console.log("🌱 ISPM – Running development seed...\n");

  // Hash password once; reuse for all dev accounts
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

  for (const userData of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        department: userData.department,
        phone: userData.phone,
        isActive: true,
        // Re-hash on each seed run so dev password stays current
        passwordHash,
      },
      create: {
        ...userData,
        passwordHash,
        isActive: true,
      },
    });

    console.log(
      `✅  ${user.role.padEnd(20)} → ${user.email}  (id: ${user.id})`
    );
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Seed complete.
 Development password: ${DEV_PASSWORD}
 Bcrypt rounds: ${SALT_ROUNDS}
 REMINDER: Do NOT use these accounts in production.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
