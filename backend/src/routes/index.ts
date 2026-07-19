import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { authRouter } from './auth.routes';
import { constituenciesRouter } from './constituencies.routes';
import { boothsRouter } from './booths.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/constituencies', requireAuth, constituenciesRouter);
apiRouter.use('/booths', requireAuth, boothsRouter);
