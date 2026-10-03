/**
 * services/quiz.service.js
 * Frontend API client for Quiz Management, Question Authoring, Employee Attempts,
 * and Server-Side Scoring.
 */
import { apiFetch } from './api.js';

/**
 * Lists quizzes with optional search.
 *
 * @param {object} [params]
 * @param {string} [params.search]
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function listQuizzesRequest(params = {}) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());

  const qs = query.toString();
  return apiFetch(`/quizzes${qs ? `?${qs}` : ''}`);
}

/**
 * Retrieves a single quiz by ID.
 *
 * @param {string} id
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getQuizRequest(id) {
  return apiFetch(`/quizzes/${id}`);
}

/**
 * Creates a new quiz associated with a TrainingModule (Training Admin only).
 *
 * @param {object} quizData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function createQuizRequest(quizData) {
  return apiFetch('/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData),
  });
}

/**
 * Updates quiz metadata (Training Admin only).
 *
 * @param {string} id
 * @param {object} quizData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function updateQuizRequest(id, quizData) {
  return apiFetch(`/quizzes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(quizData),
  });
}

/**
 * Adds a new question with answer options to a quiz (Training Admin only).
 *
 * @param {string} quizId
 * @param {object} questionData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function createQuestionRequest(quizId, questionData) {
  return apiFetch(`/quizzes/${quizId}/questions`, {
    method: 'POST',
    body: JSON.stringify(questionData),
  });
}

/**
 * Updates a question and its options (Training Admin only).
 *
 * @param {string} quizId
 * @param {string} questionId
 * @param {object} questionData
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function updateQuestionRequest(quizId, questionId, questionData) {
  return apiFetch(`/quizzes/${quizId}/questions/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify(questionData),
  });
}

/**
 * Deletes a question (Training Admin only).
 *
 * @param {string} quizId
 * @param {string} questionId
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function deleteQuestionRequest(quizId, questionId) {
  return apiFetch(`/quizzes/${quizId}/questions/${questionId}`, {
    method: 'DELETE',
  });
}

/**
 * Starts or resumes a quiz attempt (Employee only).
 *
 * @param {string} quizId
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function startQuizRequest(quizId) {
  return apiFetch(`/quizzes/${quizId}/start`, {
    method: 'POST',
  });
}

/**
 * Submits answers for an attempt and returns authoritative score (Employee only).
 *
 * @param {string} quizId
 * @param {string} attemptId
 * @param {Array<{ questionId: string, selectedOptionId: string }>} answers
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function submitQuizRequest(quizId, attemptId, answers) {
  return apiFetch(`/quizzes/${quizId}/attempts/${attemptId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

/**
 * Retrieves the authenticated Employee's personal quiz attempt results.
 *
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getMyQuizResultsRequest() {
  return apiFetch('/quizzes/my-results');
}

/**
 * Retrieves employee attempt results and metrics for a specific quiz (Training Admin only).
 *
 * @param {string} quizId
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function getQuizResultsReportRequest(quizId) {
  return apiFetch(`/quizzes/${quizId}/results`);
}
