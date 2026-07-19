import { z } from 'zod';
import { idParamSchema } from './common.validators';

export const boothIdParamSchema = idParamSchema;

export const boothSearchQuerySchema = z.object({
  q: z.string().trim().min(1, 'q is required'),
});
