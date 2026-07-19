import { Router } from 'express';
import { constituenciesRouter } from './constituencies.routes';
import { boothsRouter } from './booths.routes';

export const apiRouter = Router();

apiRouter.use('/constituencies', constituenciesRouter);
apiRouter.use('/booths', boothsRouter);
