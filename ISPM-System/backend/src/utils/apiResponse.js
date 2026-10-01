/**
 * utils/apiResponse.js
 * Consistent JSON response helpers used by all controllers.
 */

/**
 * Sends a successful JSON response.
 *
 * @param {import('express').Response} res
 * @param {object}  options
 * @param {number}  [options.status=200]
 * @param {string}  options.message
 * @param {*}       [options.data]
 */
export function sendSuccess(res, { status = 200, message, data } = {}) {
  return res.status(status).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
}

/**
 * Sends a failure JSON response.
 *
 * @param {import('express').Response} res
 * @param {object}  options
 * @param {number}  [options.status=400]
 * @param {string}  options.message
 * @param {*}       [options.errors]
 */
export function sendError(res, { status = 400, message, errors } = {}) {
  return res.status(status).json({
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  });
}
