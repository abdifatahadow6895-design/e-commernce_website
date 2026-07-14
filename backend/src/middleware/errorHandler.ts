import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  if ((err as { code?: number }).code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value entered',
    });
  }

  logger.error(err.message, { stack: err.stack });

  return res.status(500).json({
    success: false,
    message: config.env === 'production' ? 'Internal server error' : err.message,
  });
};

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Route not found', 404));
};

export const asyncHandler =
  (fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);
  };
