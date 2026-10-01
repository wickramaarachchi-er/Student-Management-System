/**
 * middleware/errorHandler.js
 * Centralized 404 and error-handling middleware.
 */

/**
 * 404 handler – reached when no route matches.
 */
export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Global error handler.
 * Express identifies this as an error handler by the 4-argument signature.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[Error] ${req.method} ${req.originalUrl} → ${status}:`, err.message);

  res.status(status).json({
    success: false,
    message: err.message ?? 'Internal Server Error',
    // Only expose stack trace in development
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
