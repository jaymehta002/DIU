import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as overviewService from '../services/overview.service';

export const getOverview = catchAsync(async (_req: Request, res: Response) => {
  const overview = await overviewService.getOverview();
  res.json({ data: overview });
});
