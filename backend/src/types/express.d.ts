declare namespace Express {
  interface Request {
    validatedParams?: Record<string, unknown>;
    validatedQuery?: Record<string, unknown>;
    validatedBody?: Record<string, unknown>;
    auth?:
      | { type: 'user'; user: { id: string; username: string } }
      | { type: 'service' };
  }
}
