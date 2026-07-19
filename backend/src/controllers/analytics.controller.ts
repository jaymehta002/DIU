import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as analyticsService from '../services/analytics.service';

export const getPartyPerformance = catchAsync(async (_req: Request, res: Response) => {
  const performance = await analyticsService.getPartyPerformance();
  res.json({ data: performance });
});
