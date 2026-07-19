import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';

export const analyticsRouter = Router();

analyticsRouter.get('/party-performance', analyticsController.getPartyPerformance);
