import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ValidationError } from '../errors';

interface ValidationTargets {
  params?: ZodSchema;
  query?: ZodSchema;
}

function formatZodError(error: ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
}

export function validate({ params, query }: ValidationTargets) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (params) {
        req.validatedParams = params.parse(req.params) as Record<string, unknown>;
      }
      if (query) {
        req.validatedQuery = query.parse(req.query) as Record<string, unknown>;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError(formatZodError(error)));
        return;
      }
      next(error);
    }
  };
}
