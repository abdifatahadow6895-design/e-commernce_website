import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Response } from 'express';
import { config } from '../config/index.js';
import { IUser } from '../models/User.js';

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = generateToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax' as const,
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        preferredLanguage: user.preferredLanguage,
        preferredCurrency: user.preferredCurrency,
        loyaltyPoints: user.loyaltyPoints,
      },
    });
};

export const generateVerificationToken = (): { token: string; hashedToken: string; expires: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, hashedToken, expires };
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
