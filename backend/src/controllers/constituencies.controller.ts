import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as constituenciesService from '../services/constituencies.service';
import * as boothsService from '../services/booths.service';

export const listConstituencies = catchAsync(async (_req: Request, res: Response) => {
  const constituencies = await constituenciesService.listConstituencies();
  res.json({ data: constituencies });
});

export const listBoothsForConstituency = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const result = await boothsService.listBoothsByConstituency(id);
  res.json({ data: result });
});

export const getConstituencyWinner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const result = await constituenciesService.getConstituencyWinner(id);
  res.json({ data: result });
});
