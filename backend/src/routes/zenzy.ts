import { Router } from 'express';
import { z } from 'zod';
import { requireSupabaseAuth, type AuthenticatedRequest } from '../authMiddleware.js';
import { processZenzyStage } from '../aiStageProcessor.js';
import { runtimeReadiness } from '../config.js';

export const moduleMap = [
  { module: 'Home', route: '/home', engines: ['Identity', 'User', 'Product'] },
  { module: 'Flows', route: '/flows', engines: ['Workflow', 'Sync', 'AI Mesh'] },
  { module: 'Tasks', route: '/tasks', engines: ['Workflow', 'User', 'Product'] },
  { module: 'Content', route: '/content', engines: ['Product', 'AI Mesh', 'Commerce'] },
  { module: 'Sync', route: '/sync', engines: ['Sync', 'Workflow', 'AI Mesh'] },
  { module: 'Users', route: '/users', engines: ['User', 'Identity'] },
  { module: 'Settings', route: '/settings', engines: ['Identity', 'Sync', 'User'] },
] as const;

const processRequestSchema = z.object({
  input: z.string().trim().min(3).max(4_000),
});

export const zenzyRouter = Router();

zenzyRouter.get('/health', (_request, response) => {
  const readiness = runtimeReadiness();
  response.status(readiness.ready ? 200 : 503).json({
    status: readiness.ready ? 'ready' : 'blocked',
    engines: ['Identity', 'Product', 'Workflow', 'Sync', 'AI Mesh', 'User', 'Commerce'],
    missingConfiguration: readiness.missing,
  });
});

zenzyRouter.get('/modules', (_request, response) => {
  response.json({ modules: moduleMap });
});

zenzyRouter.post('/process', requireSupabaseAuth, async (request: AuthenticatedRequest, response) => {
  const parsed = processRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'Input must contain 3 to 4,000 characters.' });
    return;
  }

  try {
    const transformation = await processZenzyStage(parsed.data.input);
    response.status(201).json({
      id: crypto.randomUUID(),
      userId: request.zenzyIdentity?.id,
      sourceInput: parsed.data.input,
      ...transformation,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Zenzy stage processing failed', {
      error: error instanceof Error ? error.message : 'unknown error',
    });
    response.status(502).json({ error: 'Transformation generation failed.' });
  }
});
