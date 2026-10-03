/**
 * app.js
 * Express application factory – registers security middleware, CORS, body parsers, routes, and error handlers.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

/* ── Security Headers (Helmet) ──────────────────────────── */
app.use(
  helmet({
    contentSecurityPolicy: false, // Prevents breaking Vite dev server / frontend assets
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* ── Hardened CORS Configuration ────────────────────────── */
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, Postman) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy rejection: Origin "${origin}" not allowed.`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

/* ── Body Size Parsers (1MB Limit) ──────────────────────── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/* ── Routes ─────────────────────────────────────────────── */
app.use('/api', apiRouter);

/* ── Error handlers (must be last) ─────────────────────── */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
