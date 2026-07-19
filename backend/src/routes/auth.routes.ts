import { Router } from 'express';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/requireAuth';
import { loginRateLimiter } from '../middleware/loginRateLimiter';
import { loginBodySchema } from '../validators/auth.validators';
import * as authController from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/login', loginRateLimiter, validate({ body: loginBodySchema }), authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
