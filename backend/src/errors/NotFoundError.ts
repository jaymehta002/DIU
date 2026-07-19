import { AppError } from './AppError';

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  constructor(message = 'Resource not found') {
    super(message);
  }
}
