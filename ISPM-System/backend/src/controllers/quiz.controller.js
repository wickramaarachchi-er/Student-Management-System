/**
 * controllers/quiz.controller.js
 * HTTP controllers for Quiz Authoring, Question Management, Employee Attempts,
 * and Authoritative Server-Side Scoring.
 */
import { z } from 'zod';
import * as quizService from '../services/quiz.service.js';
import { writeAuditLog, getClientIp } from '../services/audit.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Zod Schemas
const createQuizSchema = z.object({
  trainingModuleId: z.string({ required_error: 'Associated training module ID is required' }).trim().min(1, 'Training module ID cannot be empty'),
  title: z.string({ required_error: 'Quiz title is required' }).trim().min(1, 'Title cannot be empty').max(255),
  description: z.string().trim().optional().nullable(),
  passingScore: z.coerce.number().int().min(0, 'Passing score must be at least 0').max(100, 'Passing score cannot exceed 100').optional(),
  maxAttempts: z.coerce.number().int().min(1, 'Max attempts must be at least 1').optional(),
  timeLimitMinutes: z.coerce.number().int().min(1, 'Time limit must be at least 1 minute').optional().nullable(),
});

const updateQuizSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional(),
  description: z.string().trim().optional().nullable(),
  passingScore: z.coerce.number().int().min(0).max(100).optional(),
  maxAttempts: z.coerce.number().int().min(1).optional(),
  timeLimitMinutes: z.coerce.number().int().min(1).optional().nullable(),
});

const createQuestionSchema = z.object({
  questionText: z.string({ required_error: 'Question text is required' }).trim().min(1, 'Question text cannot be empty'),
  points: z.coerce.number().int().min(1, 'Points must be at least 1').optional(),
  orderIndex: z.coerce.number().int().optional(),
  options: z.array(
    z.object({
      optionText: z.string({ required_error: 'Option text is required' }).trim().min(1, 'Option text cannot be empty'),
      isCorrect: z.boolean({ required_error: 'isCorrect flag is required' }),
      orderIndex: z.coerce.number().int().optional(),
    })
  ).min(2, 'At least 2 answer options are required'),
});

const updateQuestionSchema = z.object({
  questionText: z.string().trim().min(1).optional(),
  points: z.coerce.number().int().min(1).optional(),
  orderIndex: z.coerce.number().int().optional(),
  options: z.array(
    z.object({
      optionText: z.string().trim().min(1),
      isCorrect: z.boolean(),
      orderIndex: z.coerce.number().int().optional(),
    })
  ).min(2, 'At least 2 answer options are required').optional(),
});

const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionId: z.string().min(1),
    })
  ),
});

/**
 * GET /api/quizzes
 * TRAINING_ADMIN: returns all quizzes with management statistics
 * EMPLOYEE: returns available quizzes with prerequisite and latest attempt info
 */
export async function getQuizzes(req, res, next) {
  try {
    const { search } = req.query;
    const quizzes = await quizService.listQuizzes(req.user, { search });

    return sendSuccess(res, {
      status: 200,
      message: 'Quizzes retrieved successfully',
      data: { quizzes, total: quizzes.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/quizzes/my-results
 * EMPLOYEE only: returns personal quiz attempt results
 */
export async function getMyQuizResults(req, res, next) {
  try {
    const results = await quizService.getEmployeeQuizResults(req.user.id);

    return sendSuccess(res, {
      status: 200,
      message: 'Personal quiz results retrieved successfully',
      data: { results, total: results.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/quizzes/:id
 * TRAINING_ADMIN: returns full quiz config including isCorrect
 * EMPLOYEE: returns available quiz with questions stripped of isCorrect
 */
export async function getQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const quiz = await quizService.getQuizById(id, req.user);

    return sendSuccess(res, {
      status: 200,
      message: 'Quiz retrieved successfully',
      data: { quiz },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/quizzes
 * TRAINING_ADMIN only: create new quiz
 */
export async function createQuiz(req, res, next) {
  try {
    const parsed = createQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid input data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    const newQuiz = await quizService.createQuiz(parsed.data);

    // Audit Log
    await writeAuditLog({
      action: 'QUIZ_CREATED',
      userId: req.user.id,
      entityType: 'Quiz',
      entityId: newQuiz.id,
      description: `Quiz created: "${newQuiz.title}" (Module: ${newQuiz.trainingModule.title}) by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 201,
      message: 'Quiz created successfully',
      data: { quiz: newQuiz },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/quizzes/:id
 * TRAINING_ADMIN only: update quiz metadata
 */
export async function updateQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = updateQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid input data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    const updated = await quizService.updateQuiz(id, parsed.data);

    // Audit Log
    await writeAuditLog({
      action: 'QUIZ_UPDATED',
      userId: req.user.id,
      entityType: 'Quiz',
      entityId: updated.id,
      description: `Quiz updated: "${updated.title}" by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Quiz updated successfully',
      data: { quiz: updated },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/quizzes/:id/questions
 * TRAINING_ADMIN only: add question with options
 */
export async function createQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = createQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid input data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    const question = await quizService.createQuestion(id, parsed.data);

    // Audit Log
    await writeAuditLog({
      action: 'QUIZ_QUESTION_CREATED',
      userId: req.user.id,
      entityType: 'QuizQuestion',
      entityId: question.id,
      description: `Question added to quiz ${id}: "${question.questionText.substring(0, 50)}..." by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 201,
      message: 'Question created successfully',
      data: { question },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/quizzes/:id/questions/:questionId
 * TRAINING_ADMIN only: update question and/or options
 */
export async function updateQuestion(req, res, next) {
  try {
    const { id, questionId } = req.params;
    const parsed = updateQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid input data.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    const updated = await quizService.updateQuestion(id, questionId, parsed.data);

    // Audit Log
    await writeAuditLog({
      action: 'QUIZ_QUESTION_UPDATED',
      userId: req.user.id,
      entityType: 'QuizQuestion',
      entityId: updated.id,
      description: `Question ${questionId} updated in quiz ${id} by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Question updated successfully',
      data: { question: updated },
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * DELETE /api/quizzes/:id/questions/:questionId
 * TRAINING_ADMIN only: delete question
 */
export async function deleteQuestion(req, res, next) {
  try {
    const { id, questionId } = req.params;
    await quizService.deleteQuestion(id, questionId);

    // Audit Log
    await writeAuditLog({
      action: 'QUIZ_QUESTION_DELETED',
      userId: req.user.id,
      entityType: 'QuizQuestion',
      entityId: questionId,
      description: `Question ${questionId} deleted from quiz ${id} by ${req.user.email}`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Question deleted successfully',
      data: null,
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/quizzes/:id/start
 * EMPLOYEE only: start or resume a quiz attempt
 */
export async function startQuiz(req, res, next) {
  try {
    const { id } = req.params;
    // Always use req.user.id - never trust client input
    const data = await quizService.startQuizAttempt(id, req.user.id);

    // Audit Log
    await writeAuditLog({
      action: 'QUIZ_STARTED',
      userId: req.user.id,
      entityType: 'QuizAttempt',
      entityId: data.attempt.id,
      description: `Quiz attempt #${data.attempt.attemptNumber} started by ${req.user.email} (quizId: ${id})`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Quiz attempt started successfully',
      data,
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/quizzes/:id/attempts/:attemptId/submit
 * EMPLOYEE only: submit answers and receive authoritative score
 */
export async function submitQuiz(req, res, next) {
  try {
    const { id, attemptId } = req.params;
    const parsed = submitQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid answers format.';
      return sendError(res, { status: 400, message: firstError, errors: parsed.error.flatten().fieldErrors });
    }

    // Authoritative server-side scoring
    const result = await quizService.submitQuizAttempt(id, attemptId, req.user.id, parsed.data.answers);

    // Audit Log (safe summary: quizId, attemptId, score, pass/fail, NO secrets)
    await writeAuditLog({
      action: 'QUIZ_SUBMITTED',
      userId: req.user.id,
      entityType: 'QuizAttempt',
      entityId: attemptId,
      description: `Quiz submitted by ${req.user.email}: Score ${result.score}%, ${result.isPassed ? 'PASSED' : 'FAILED'} (Quiz: "${result.quizTitle}")`,
      ipAddress: getClientIp(req),
    });

    return sendSuccess(res, {
      status: 200,
      message: 'Quiz attempt evaluated and submitted successfully',
      data: result,
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/quizzes/:id/results
 * TRAINING_ADMIN only: view employee results report
 */
export async function getQuizResults(req, res, next) {
  try {
    const { id } = req.params;
    const report = await quizService.getQuizResultsReport(id);

    return sendSuccess(res, {
      status: 200,
      message: 'Quiz results report retrieved successfully',
      data: report,
    });
  } catch (err) {
    if (err.status) {
      return sendError(res, { status: err.status, message: err.message });
    }
    next(err);
  }
}
