import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { UnauthorizedError } from '../errors';
import { AUTH_COOKIE_NAME } from '../services/authCookie';
import { verifyToken } from '../services/auth.service';

function extractBearerToken(req: Request): string | undefined {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length);
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = req.header('X-API-Key');
  if (apiKey && apiKey === env.MOBILE_API_KEY) {
    req.auth = { type: 'service' };
    next();
    return;
  }

  const token = extractBearerToken(req) ?? (req.cookies?.[AUTH_COOKIE_NAME] as string | undefined);
  if (!token) {
    next(new UnauthorizedError());
    return;
  }

  try {
    const payload = verifyToken(token);
    req.auth = { type: 'user', user: { id: payload.sub, username: payload.username } };
    next();
  } catch {
    next(new UnauthorizedError());
  }
}
