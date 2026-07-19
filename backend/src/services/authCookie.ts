import type { CookieOptions } from 'express';
import ms from 'ms';
import { env } from '../config/env';

export const AUTH_COOKIE_NAME = 'auth_token';

export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ms(env.JWT_EXPIRES_IN as ms.StringValue),
  };
}
