/**
 * middleware/errorHandler.js
 * Centralized 404 and safe error-handling middleware.
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
  // Handle CORS policy rejection errors
  if (err.message && err.message.startsWith('CORS policy rejection')) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  // Handle malformed JSON body errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.',
    });
  }

  // Handle entity payload too large (413)
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: 'Request payload exceeds maximum allowed size (1MB).',
    });
  }

  const status = err.status ?? err.statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[Error] ${req.method} ${req.originalUrl} → ${status}:`, err.stack || err.message);

  // Safe user-facing message for 500 errors to prevent database leak
  let clientMessage = err.message ?? 'Internal server error.';
  if (status === 500 && (err.name?.includes('Prisma') || !err.status)) {
    clientMessage = 'An unexpected internal server error occurred.';
  }

  res.status(status).json({
    success: false,
    message: clientMessage,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
