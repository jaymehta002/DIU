import { Router } from 'express';
import { validate } from '../middleware/validate';
import { constituencyIdParamSchema } from '../validators/constituencies.validators';
import * as constituenciesController from '../controllers/constituencies.controller';

export const constituenciesRouter = Router();

constituenciesRouter.get('/', constituenciesController.listConstituencies);

constituenciesRouter.get(
  '/:id/booths',
  validate({ params: constituencyIdParamSchema }),
  constituenciesController.listBoothsForConstituency,
);
