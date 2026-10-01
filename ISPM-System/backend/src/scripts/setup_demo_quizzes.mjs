import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SETTING UP DEMO QUIZZES ---');

  // 1. Clean up temporary test modules/quizzes from automated backend test script
  const testModules = await prisma.trainingModule.findMany({
    where: {
      title: { in: ['Test Phishing Security Module', 'Test Unfinished Training Module'] }
    }
  });

  for (const mod of testModules) {
    // Delete attempts and questions for this module's quiz if any
    const quiz = await prisma.quiz.findUnique({ where: { trainingModuleId: mod.id } });
    if (quiz) {
      const attempts = await prisma.quizAttempt.findMany({ where: { quizId: quiz.id } });
      for (const a of attempts) {
        await prisma.quizAnswer.deleteMany({ where: { attemptId: a.id } });
      }
      await prisma.quizAttempt.deleteMany({ where: { quizId: quiz.id } });

      const questions = await prisma.quizQuestion.findMany({ where: { quizId: quiz.id } });
      for (const q of questions) {
        await prisma.quizOption.deleteMany({ where: { questionId: q.id } });
      }
      await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
      await prisma.quiz.delete({ where: { id: quiz.id } });
    }
    await prisma.trainingProgress.deleteMany({ where: { trainingModuleId: mod.id } });
    await prisma.trainingModule.delete({ where: { id: mod.id } });
    console.log(`Cleaned up test module: ${mod.title}`);
  }

  // 2. Find published demo modules
  const phishingModule = await prisma.trainingModule.findFirst({
    where: { title: 'Phishing Awareness Fundamentals' }
  });
  const passwordModule = await prisma.trainingModule.findFirst({
    where: { title: 'Secure Password & Credential Hygiene' }
  });

  if (!phishingModule || !passwordModule) {
    throw new Error('Required demo training modules not found!');
  }

  // 3. Create or update Quiz for Phishing Awareness Fundamentals
  let phishingQuiz = await prisma.quiz.findUnique({
    where: { trainingModuleId: phishingModule.id }
  });

  if (phishingQuiz) {
    // Clean old questions to re-seed cleanly
    const attempts = await prisma.quizAttempt.findMany({ where: { quizId: phishingQuiz.id } });
    for (const a of attempts) {
      await prisma.quizAnswer.deleteMany({ where: { attemptId: a.id } });
    }
    await prisma.quizAttempt.deleteMany({ where: { quizId: phishingQuiz.id } });
    const questions = await prisma.quizQuestion.findMany({ where: { quizId: phishingQuiz.id } });
    for (const q of questions) {
      await prisma.quizOption.deleteMany({ where: { questionId: q.id } });
    }
    await prisma.quizQuestion.deleteMany({ where: { quizId: phishingQuiz.id } });
    await prisma.quiz.delete({ where: { id: phishingQuiz.id } });
  }

  phishingQuiz = await prisma.quiz.create({
    data: {
      title: 'Phishing Awareness & Social Engineering Quiz',
      description: 'Evaluate your ability to identify suspicious emails, verify senders, and respond correctly to social engineering tactics.',
      passingScore: 75,
      trainingModuleId: phishingModule.id,
      questions: {
        create: [
          {
            questionText: 'Which of the following is a primary warning sign of a phishing email?',
            orderIndex: 0,
            options: {
              create: [
                { optionText: 'An unexpected urgent request asking you to click an unfamiliar link or verify your password', isCorrect: true },
                { optionText: 'An email sent from your supervisor during regular business hours', isCorrect: false },
                { optionText: 'A calendar invitation for an official scheduled all-hands company meeting', isCorrect: false },
                { optionText: 'A newsletter from an internal department with verified intranet links', isCorrect: false }
              ]
            }
          },
          {
            questionText: 'What should you do immediately if you receive a suspicious email claiming your account will be suspended?',
            orderIndex: 1,
            options: {
              create: [
                { optionText: 'Click the verification link immediately to check if the destination is legitimate', isCorrect: false },
                { optionText: 'Forward the email to all department coworkers asking if they received it', isCorrect: false },
                { optionText: 'Report the message using the Phishing Alert button and do not click any links', isCorrect: true },
                { optionText: 'Reply to the sender asking them to verify their corporate credentials', isCorrect: false }
              ]
            }
          },
          {
            questionText: 'What is "Spear Phishing"?',
            orderIndex: 2,
            options: {
              create: [
                { optionText: 'A targeted phishing attack tailored specifically to a chosen individual or organization', isCorrect: true },
                { optionText: 'Spam emails sent indiscriminately to millions of random addresses', isCorrect: false },
                { optionText: 'A computer hardware failure caused by faulty network wiring', isCorrect: false },
                { optionText: 'An automated antivirus scanner detecting macro viruses', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  });
  console.log(`Created demo quiz: "${phishingQuiz.title}" (ID: ${phishingQuiz.id})`);

  // 4. Create Quiz for Password Module
  let passwordQuiz = await prisma.quiz.findUnique({
    where: { trainingModuleId: passwordModule.id }
  });

  if (passwordQuiz) {
    const attempts = await prisma.quizAttempt.findMany({ where: { quizId: passwordQuiz.id } });
    for (const a of attempts) {
      await prisma.quizAnswer.deleteMany({ where: { attemptId: a.id } });
    }
    await prisma.quizAttempt.deleteMany({ where: { quizId: passwordQuiz.id } });
    const questions = await prisma.quizQuestion.findMany({ where: { quizId: passwordQuiz.id } });
    for (const q of questions) {
      await prisma.quizOption.deleteMany({ where: { questionId: q.id } });
    }
    await prisma.quizQuestion.deleteMany({ where: { quizId: passwordQuiz.id } });
    await prisma.quiz.delete({ where: { id: passwordQuiz.id } });
  }

  passwordQuiz = await prisma.quiz.create({
    data: {
      title: 'Password Security & Credential Hygiene Assessment',
      description: 'Test your understanding of passphrase complexity, multi-factor authentication, and safe credential handling.',
      passingScore: 80,
      trainingModuleId: passwordModule.id,
      questions: {
        create: [
          {
            questionText: 'Which of the following practices represents strong password security?',
            orderIndex: 0,
            options: {
              create: [
                { optionText: 'Reusing the same complex password across both work and personal accounts', isCorrect: false },
                { optionText: 'Using a unique passphrase of 16+ characters combined with Multi-Factor Authentication (MFA)', isCorrect: true },
                { optionText: 'Writing your password on a sticky note attached beneath your desk', isCorrect: false },
                { optionText: 'Sharing your password with team members for emergency access', isCorrect: false }
              ]
            }
          },
          {
            questionText: 'When is it appropriate to share your corporate password with IT support?',
            orderIndex: 1,
            options: {
              create: [
                { optionText: 'Whenever IT support requests it via phone or email for diagnostics', isCorrect: false },
                { optionText: 'Only during high-priority system outage emergencies', isCorrect: false },
                { optionText: 'Never; legitimate IT support personnel will never request your password', isCorrect: true },
                { optionText: 'Only if the technician provides their employee ID number', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  });
  console.log(`Created demo quiz: "${passwordQuiz.title}" (ID: ${passwordQuiz.id})`);

  console.log('--- DEMO SETUP COMPLETED SUCCESSFULLY ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
