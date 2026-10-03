import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      trainingModule: { select: { id: true, title: true, isPublished: true } },
      questions: { include: { options: true } },
      attempts: { include: { user: { select: { email: true, role: true } } } }
    }
  });

  console.log('--- CURRENT QUIZZES IN DB (' + quizzes.length + ') ---');
  quizzes.forEach(q => {
    console.log(`- Quiz ID: ${q.id} | Title: "${q.title}" | Module: "${q.trainingModule?.title}" | Questions: ${q.questions.length} | Attempts: ${q.attempts.length}`);
  });

  const trainingModules = await prisma.trainingModule.findMany({
    select: { id: true, title: true, isPublished: true, quiz: { select: { id: true, title: true } } }
  });
  console.log('--- CURRENT TRAINING MODULES (' + trainingModules.length + ') ---');
  trainingModules.forEach(m => {
    console.log(`- Module ID: ${m.id} | Title: "${m.title}" | Published: ${m.isPublished} | Has Quiz: ${!!m.quiz}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
