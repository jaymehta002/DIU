import { AppError } from './AppError';

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';

  constructor(message = 'Invalid request') {
    super(message);
  }
}
