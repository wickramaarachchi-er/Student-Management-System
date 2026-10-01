/**
 * app.js
 * Express application factory – registers middleware, routes, and error handlers.
 */
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

/* ── Middleware ─────────────────────────────────────────── */

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

/* ── Routes ─────────────────────────────────────────────── */
app.use('/api', apiRouter);

/* ── Error handlers (must be last) ─────────────────────── */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
