import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as boothsService from '../services/booths.service';

export const getBooth = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const booth = await boothsService.getBoothById(id);
  res.json({ data: booth });
});

export const searchBooths = catchAsync(async (req: Request, res: Response) => {
  const { q } = req.validatedQuery as { q: string };
  const results = await boothsService.searchBooths(q);
  res.json({ data: results });
});
