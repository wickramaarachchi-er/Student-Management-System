/**
 * server.js
 * Entry point – creates the HTTP server and starts listening.
 */
import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`\n🚀 ISPM API server running on port ${PORT}`);
  console.log(`   Environment : ${env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
