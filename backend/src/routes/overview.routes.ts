import { Router } from 'express';
import * as overviewController from '../controllers/overview.controller';

export const overviewRouter = Router();

overviewRouter.get('/', overviewController.getOverview);
