/**
 * routes/quiz.js
 * Quiz Management, Question Authoring, Employee Attempts, and Scoring routes with strict RBAC.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import {
  getQuizzes,
  getMyQuizResults,
  getQuiz,
  createQuiz,
  updateQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  startQuiz,
  submitQuiz,
  getQuizResults,
} from '../controllers/quiz.controller.js';

const router = Router();

// All quiz endpoints require authentication
router.use(authenticate);

// View list of quizzes: TRAINING_ADMIN and EMPLOYEE
router.get('/', authorizeRoles('TRAINING_ADMIN', 'EMPLOYEE'), getQuizzes);

// Personal quiz attempt history: EMPLOYEE only
router.get('/my-results', authorizeRoles('EMPLOYEE'), getMyQuizResults);

// Quiz results and metrics report: TRAINING_ADMIN only
router.get('/:id/results', authorizeRoles('TRAINING_ADMIN'), getQuizResults);

// View quiz details/questions: TRAINING_ADMIN and EMPLOYEE
router.get('/:id', authorizeRoles('TRAINING_ADMIN', 'EMPLOYEE'), getQuiz);

// Quiz creation and metadata management: TRAINING_ADMIN only
router.post('/', authorizeRoles('TRAINING_ADMIN'), createQuiz);
router.patch('/:id', authorizeRoles('TRAINING_ADMIN'), updateQuiz);

// Question and options management: TRAINING_ADMIN only
router.post('/:id/questions', authorizeRoles('TRAINING_ADMIN'), createQuestion);
router.patch('/:id/questions/:questionId', authorizeRoles('TRAINING_ADMIN'), updateQuestion);
router.delete('/:id/questions/:questionId', authorizeRoles('TRAINING_ADMIN'), deleteQuestion);

// Employee quiz taking workflow: EMPLOYEE only
router.post('/:id/start', authorizeRoles('EMPLOYEE'), startQuiz);
router.post('/:id/attempts/:attemptId/submit', authorizeRoles('EMPLOYEE'), submitQuiz);

export default router;
