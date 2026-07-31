import type { NextFunction, Request, Response } from 'express';
import { getSupabaseClient } from './supabaseClient.js';

export type ZenzyIdentity = {
  id: string;
  email?: string;
};

export type AuthenticatedRequest = Request & {
  zenzyIdentity?: ZenzyIdentity;
};

function bearerToken(request: Request): string | undefined {
  const [scheme, token] = request.header('authorization')?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : undefined;
}

export async function requireSupabaseAuth(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  const token = bearerToken(request);
  if (!token) {
    response.status(401).json({ error: 'Bearer token required.' });
    return;
  }

  try {
    const { data, error } = await getSupabaseClient().auth.getUser(token);
    if (error || !data.user) {
      response.status(401).json({ error: 'Invalid or expired access token.' });
      return;
    }

    request.zenzyIdentity = {
      id: data.user.id,
      ...(data.user.email ? { email: data.user.email } : {}),
    };
    next();
  } catch {
    response.status(503).json({ error: 'Identity service unavailable.' });
  }
}
