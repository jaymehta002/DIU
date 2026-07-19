import { Router } from 'express';
import { validate } from '../middleware/validate';
import { boothIdParamSchema, boothSearchQuerySchema } from '../validators/booths.validators';
import * as boothsController from '../controllers/booths.controller';

export const boothsRouter = Router();

boothsRouter.get('/search', validate({ query: boothSearchQuerySchema }), boothsController.searchBooths);

boothsRouter.get('/:id', validate({ params: boothIdParamSchema }), boothsController.getBooth);
