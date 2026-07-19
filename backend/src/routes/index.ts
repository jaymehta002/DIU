import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { authRouter } from './auth.routes';
import { constituenciesRouter } from './constituencies.routes';
import { boothsRouter } from './booths.routes';
import { overviewRouter } from './overview.routes';
import { partiesRouter } from './parties.routes';
import { analyticsRouter } from './analytics.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/constituencies', requireAuth, constituenciesRouter);
apiRouter.use('/booths', requireAuth, boothsRouter);
apiRouter.use('/overview', requireAuth, overviewRouter);
apiRouter.use('/parties', requireAuth, partiesRouter);
apiRouter.use('/analytics', requireAuth, analyticsRouter);
