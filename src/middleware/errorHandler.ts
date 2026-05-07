import { Request, Response, NextFunction } from 'express';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

const errorHandler = (err: MongoError, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);

  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ error: messages.join(', ') });
    return;
  }

  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    res.status(400).json({ error: `${field} already exists` });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }

  const status = (err as { status?: number }).status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
};

export default errorHandler;
