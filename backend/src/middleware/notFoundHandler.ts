import type { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { message: `Cannot ${req.method} ${req.originalUrl}`, code: 'NOT_FOUND' },
  });
}
