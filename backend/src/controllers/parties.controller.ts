import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as partiesService from '../services/parties.service';

export const listParties = catchAsync(async (_req: Request, res: Response) => {
  const parties = await partiesService.listParties();
  res.json({ data: parties });
});
