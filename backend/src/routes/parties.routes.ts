import { Router } from 'express';
import * as partiesController from '../controllers/parties.controller';

export const partiesRouter = Router();

partiesRouter.get('/', partiesController.listParties);
