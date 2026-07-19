import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { UnauthorizedError } from '../errors';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../services/authCookie';
import { findUserByUsername, findUserById, signToken, verifyPassword } from '../services/auth.service';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { username, password } = req.validatedBody as { username: string; password: string };

  const user = await findUserByUsername(username);
  const passwordMatches = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = signToken({ sub: user.id, username: user.username });
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
  res.json({ data: { id: user.id, username: user.username } });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());
  res.status(204).send();
});

export const me = catchAsync(async (req: Request, res: Response) => {
  if (req.auth?.type !== 'user') {
    throw new UnauthorizedError();
  }

  const user = await findUserById(req.auth.user.id);
  if (!user) {
    throw new UnauthorizedError();
  }

  res.json({ data: user });
});
