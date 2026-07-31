import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { getRuntimeConfig } from './config.js';
import { zenzyRouter } from './routes/zenzy.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:8081' }));
  app.use(express.json({ limit: '32kb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-8' }));

  app.get('/api/healthz', (_request, response) => {
    response.json({ status: 'ok', service: 'zenzy-backend-runtime' });
  });
  app.use('/api/zenzy', zenzyRouter);

  app.use((_request, response) => {
    response.status(404).json({ error: 'Route not found.' });
  });

  return app;
}

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  const config = getRuntimeConfig();
  createApp().listen(config.PORT, () => {
    console.log(`Zenzy backend runtime listening on port ${config.PORT}.`);
  });
}
