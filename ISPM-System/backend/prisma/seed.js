/**
 * ISPM System – Development Seed Script
 * ============================================================
 * Seeds primary demo users, departmental demo users, realistic policies,
 * training modules, quizzes, questions, options, attempt evidence,
 * helpdesk tickets, responses, and notifications for local development.
 *
 * Usage:
 *   npm run db:seed
 * ============================================================
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEV_PASSWORD = "Ispm@Dev2024!";
const SALT_ROUNDS = 10;

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
  {
    firstName: "CS Active",
    lastName: "User",
    email: "dept.cs.active@university.edu",
    role: "EMPLOYEE",
    department: "Computer Science",
    phone: "+94 71 000 0005",
  },
  {
    firstName: "IT Active",
    lastName: "User",
    email: "dept.it.active@university.edu",
    role: "EMPLOYEE",
    department: "IT",
    phone: "+94 71 000 0006",
  },
  {
    firstName: "CS Inactive",
    lastName: "User",
    email: "dept.cs.inactive@university.edu",
    role: "EMPLOYEE",
    department: "Computer Science",
    phone: "+94 71 000 0007",
    isActive: false,
  },
];

async function main() {
  console.log("🌱 ISPM – Running development seed...\n");

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

  const userMap = {};
  for (const userData of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        department: userData.department,
        phone: userData.phone,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        passwordHash,
      },
      create: {
        ...userData,
        passwordHash,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
      },
    });

    userMap[user.email] = user;
    console.log(`✅ ${user.role.padEnd(20)} → ${user.email} (id: ${user.id})`);
  }

  const sysAdmin = userMap["admin@ispm.local"];
  const compOfficer = userMap["compliance@ispm.local"];
  const trainAdmin = userMap["training@ispm.local"];
  const primaryEmp = userMap["employee@ispm.local"];

  // 1. Seed Realistic Policies
  const policies = [
    {
      title: "Information Security Acceptable Use Policy",
      description: "Defines acceptable use guidelines for university IT assets, network access, and data resources.",
      category: "Acceptable Use",
      targetDepartment: null,
      status: "PUBLISHED",
      content: "1. Overview\nThis policy establishes rules for responsible use of computing resources.\n2. Security Requirements\nUsers must not share passwords or connect unauthorized hardware.",
    },
    {
      title: "Password & Credential Security Policy",
      description: "Mandates minimum password complexity, multi-factor authentication, and credential storage requirements.",
      category: "Access Control",
      targetDepartment: null,
      status: "PUBLISHED",
      content: "1. Password Guidelines\nPasswords must be at least 12 characters long.\n2. MFA\nMulti-factor authentication is required for all web logins.",
    },
    {
      title: "Data Protection & Classification Standard",
      description: "Establishes data sensitivity tiers (Public, Internal, Confidential, Restricted) and encryption standards.",
      category: "Data Governance",
      targetDepartment: null,
      status: "PUBLISHED",
      content: "1. Classification Tiers\nData must be labeled according to risk level.\n2. Encryption\nAll Confidential and Restricted data must be encrypted at rest and in transit.",
    },
    {
      title: "Phishing Awareness & Email Security Standard",
      description: "Guidelines for identifying suspicious communications and reporting security incidents.",
      category: "Threat Management",
      targetDepartment: null,
      status: "PUBLISHED",
      content: "1. Phishing Red Flags\nVerify sender email addresses and check links before clicking.\n2. Incident Reporting\nReport suspicious emails immediately to the Information Security Helpdesk.",
    },
    {
      title: "Departmental Special Operations Security Guidelines",
      description: "Specialized security requirements for high-risk computing environments.",
      category: "Operations Security",
      targetDepartment: "Computer Science",
      status: "PUBLISHED",
      content: "1. Lab Security\nLab systems must be isolated from student personal networks.",
    },
  ];

  const policyMap = {};
  for (const polData of policies) {
    let pol = await prisma.policy.findFirst({ where: { title: polData.title }, include: { versions: true } });
    if (!pol) {
      pol = await prisma.policy.create({
        data: {
          title: polData.title,
          description: polData.description,
          category: polData.category,
          targetDepartment: polData.targetDepartment,
          status: polData.status,
          publishedAt: new Date(),
          creatorId: compOfficer.id,
          versions: {
            create: [
              {
                versionNumber: 1,
                content: polData.content,
                changedBy: compOfficer.email,
              },
            ],
          },
        },
        include: { versions: true },
      });
      console.log(`📄 Policy created: ${polData.title}`);
    }
    policyMap[polData.title] = pol;
  }

  // 2. Policy Acknowledgements for Primary Demo Employee
  const accPol = policyMap["Information Security Acceptable Use Policy"];
  const passPol = policyMap["Password & Credential Security Policy"];

  if (accPol?.versions[0]) {
    await prisma.policyAcknowledgement.upsert({
      where: { userId_policyVersionId: { userId: primaryEmp.id, policyVersionId: accPol.versions[0].id } },
      update: {},
      create: { userId: primaryEmp.id, policyId: accPol.id, policyVersionId: accPol.versions[0].id },
    });
  }
  if (passPol?.versions[0]) {
    await prisma.policyAcknowledgement.upsert({
      where: { userId_policyVersionId: { userId: primaryEmp.id, policyVersionId: passPol.versions[0].id } },
      update: {},
      create: { userId: primaryEmp.id, policyId: passPol.id, policyVersionId: passPol.versions[0].id },
    });
  }

  // 3. Seed Realistic Training Modules
  const realisticTraining = [
    {
      title: "Secure Password & Credential Hygiene",
      description: "Best practices for creating strong passphrases and protecting system credentials.",
      content: "Module covering password entropy, credential stuffing protection, and safe password management.",
      resourceUrl: "https://security.university.edu/train/passwords",
      isPublished: true,
    },
    {
      title: "Phishing Awareness & Social Engineering Prevention",
      description: "Interactive training on identifying phishing emails, pretexting, and deceptive links.",
      content: "Learn to recognize social engineering tactics and inspect email headers and URLs safely.",
      resourceUrl: "https://security.university.edu/train/phishing",
      isPublished: true,
    },
    {
      title: "Clean Desk & Physical Workplace Security",
      description: "Physical security guidelines for locking workstations and handling paper documents.",
      content: "Physical security controls, clear desk policies, and device theft prevention.",
      resourceUrl: "https://security.university.edu/train/physical",
      isPublished: false,
    },
    {
      title: "Data Protection & Privacy Training",
      description: "Handling sensitive employee and student data in compliance with privacy regulations.",
      content: "Data handling, classification tiers, and confidential data storage guidelines.",
      resourceUrl: "https://security.university.edu/train/privacy",
      isPublished: true,
    },
  ];

  const createdModules = {};
  for (const trData of realisticTraining) {
    let mod = await prisma.trainingModule.findFirst({ where: { title: trData.title } });
    if (!mod) {
      mod = await prisma.trainingModule.create({
        data: {
          title: trData.title,
          description: trData.description,
          content: trData.content,
          resourceUrl: trData.resourceUrl,
          isPublished: trData.isPublished,
          creatorId: trainAdmin.id,
        },
      });
      console.log(`🎓 Training created: ${mod.title}`);
    }
    createdModules[trData.title] = mod;
  }

  // 4. Training Progress for Primary Demo Employee (Password & Phishing Completed)
  const passMod = createdModules["Secure Password & Credential Hygiene"];
  const phishMod = createdModules["Phishing Awareness & Social Engineering Prevention"];

  if (passMod) {
    await prisma.trainingProgress.upsert({
      where: { userId_trainingModuleId: { userId: primaryEmp.id, trainingModuleId: passMod.id } },
      update: { status: "COMPLETED", progressPercent: 100, completedAt: new Date() },
      create: { userId: primaryEmp.id, trainingModuleId: passMod.id, status: "COMPLETED", progressPercent: 100, assignedAt: new Date(), completedAt: new Date() },
    });
  }
  if (phishMod) {
    await prisma.trainingProgress.upsert({
      where: { userId_trainingModuleId: { userId: primaryEmp.id, trainingModuleId: phishMod.id } },
      update: { status: "COMPLETED", progressPercent: 100, completedAt: new Date() },
      create: { userId: primaryEmp.id, trainingModuleId: phishMod.id, status: "COMPLETED", progressPercent: 100, assignedAt: new Date(), completedAt: new Date() },
    });
  }

  // 5. Seed Quizzes & Questions
  if (passMod) {
    let passQuiz = await prisma.quiz.findFirst({ where: { trainingModuleId: passMod.id }, include: { questions: { include: { options: true } } } });
    if (!passQuiz) {
      passQuiz = await prisma.quiz.create({
        data: {
          trainingModuleId: passMod.id,
          title: "Password Security & Credential Hygiene Assessment",
          description: "Assess your knowledge of password rules and multi-factor authentication.",
          passingScore: 75,
          maxAttempts: 3,
          timeLimitMinutes: 15,
          questions: {
            create: [
              {
                questionText: "Which of the following is the most secure passphrase strategy?",
                points: 10,
                orderIndex: 0,
                options: {
                  create: [
                    { optionText: "A long phrase of 4+ random words with numbers & symbols", isCorrect: true, orderIndex: 0 },
                    { optionText: "Your birthdate followed by your pet name", isCorrect: false, orderIndex: 1 },
                    { optionText: "Reusing your personal email password across work systems", isCorrect: false, orderIndex: 2 },
                  ],
                },
              },
              {
                questionText: "What should you do if you suspect your password has been compromised?",
                points: 10,
                orderIndex: 1,
                options: {
                  create: [
                    { optionText: "Change your password immediately and notify IT Security", isCorrect: true, orderIndex: 0 },
                    { optionText: "Wait for the quarterly system password reset prompt", isCorrect: false, orderIndex: 1 },
                    { optionText: "Share your account with a coworker to monitor activity", isCorrect: false, orderIndex: 2 },
                  ],
                },
              },
            ],
          },
        },
        include: { questions: { include: { options: true } } },
      });
      console.log(`📝 Quiz created: ${passQuiz.title}`);
    }

    // Quiz Attempt & Answer for Primary Employee
    let passAttempt = await prisma.quizAttempt.findFirst({ where: { userId: primaryEmp.id, quizId: passQuiz.id } });
    if (!passAttempt) {
      passAttempt = await prisma.quizAttempt.create({
        data: {
          userId: primaryEmp.id,
          quizId: passQuiz.id,
          attemptNumber: 1,
          score: 100,
          isPassed: true,
          submittedAt: new Date(),
        },
      });
      for (const q of passQuiz.questions) {
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (correctOpt) {
          await prisma.quizAnswer.create({
            data: {
              attemptId: passAttempt.id,
              questionId: q.id,
              selectedOptionId: correctOpt.id,
            },
          });
        }
      }
    }
  }

  // 6. Seed Helpdesk Tickets & Responses
  const helpdeskTickets = [
    {
      subject: "Suspicious Phishing Email Report - Attachment Claiming Urgent Invoice",
      description: "I received an email from an external domain claiming to be an unpaid invoice. I have not opened the attachment.",
      priority: "HIGH",
      status: "RESOLVED",
      responses: [
        {
          responderId: sysAdmin.id,
          responseText: "Thank you for reporting. IT Security has analyzed the attachment and confirmed it is malicious. The domain has been blocked.",
        },
      ],
    },
    {
      subject: "MFA Reset Request Following Mobile Device Replacement",
      description: "I replaced my mobile phone and need assistance re-pairing my authenticator app for system login.",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      responses: [
        {
          responderId: sysAdmin.id,
          responseText: "Verification complete. Please check your secondary email for the temporary one-time pairing code.",
        },
      ],
    },
    {
      subject: "Clarification on Encrypted External USB Drive Usage Policy",
      description: "Does Policy SEC-02 permit hardware-encrypted USB drives for off-site data backup during travel?",
      priority: "LOW",
      status: "OPEN",
      responses: [],
    },
  ];

  for (const tData of helpdeskTickets) {
    const existingTicket = await prisma.helpdeskTicket.findFirst({ where: { subject: tData.subject } });
    if (!existingTicket) {
      await prisma.helpdeskTicket.create({
        data: {
          creatorId: primaryEmp.id,
          subject: tData.subject,
          description: tData.description,
          priority: tData.priority,
          status: tData.status,
          responses: {
            create: tData.responses.map((r) => ({
              responderId: r.responderId,
              responseText: r.responseText,
            })),
          },
        },
      });
      console.log(`🎫 Helpdesk ticket created: ${tData.subject}`);
    }
  }

  // 7. Seed Demo Notifications for Primary Employee
  const notifications = [
    {
      recipientId: primaryEmp.id,
      title: "Policy Update Required",
      message: 'A new version of "Information Security Acceptable Use Policy" requires your acknowledgement.',
      type: "POLICY_PUBLISHED",
      isRead: true,
    },
    {
      recipientId: primaryEmp.id,
      title: "Helpdesk Ticket Update",
      message: 'Your ticket "Suspicious Phishing Email Report" status updated to RESOLVED.',
      type: "TICKET_UPDATE",
      isRead: false,
    },
  ];

  for (const nData of notifications) {
    const existingNotif = await prisma.notification.findFirst({ where: { recipientId: nData.recipientId, title: nData.title } });
    if (!existingNotif) {
      await prisma.notification.create({ data: nData });
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" Seed complete.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
