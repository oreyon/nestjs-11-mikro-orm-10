import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@nestjs/common';

/**
 * @description
 * if you want to allow all origins, you can add '*' to the allowedOrigins array
 * '*' in const allowedOrigins
 * not recomended for production, but useful for development purposes
 *
 */
const allowedOrigins: string | string[] = [
  `${process.env.IP_FRONTEND_ORIGIN}`,
  'http://localhost:5173',
  // '*',
];

export const originRestrictionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const origin = req.get('origin') || req.get('referer') || '';

  const isAllowed =
    allowedOrigins.includes('*') ||
    allowedOrigins.some((allowedOrigin: string): boolean =>
      origin.startsWith(allowedOrigin),
    );

  if (!isAllowed) {
    throw new HttpException(
      "You don't have permission to access resources on this server",
      403,
    );
  }

  next(); // safe to continue
};
