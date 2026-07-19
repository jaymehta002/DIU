declare namespace Express {
  interface Request {
    validatedParams?: Record<string, unknown>;
    validatedQuery?: Record<string, unknown>;
  }
}
