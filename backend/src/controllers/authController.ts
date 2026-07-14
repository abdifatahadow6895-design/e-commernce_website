import { Response } from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/AppError.js';
import { config } from '../config/index.js';
import {
  sendTokenResponse,
  generateVerificationToken,
  hashToken,
} from '../services/tokenService.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, email, password, referralCode } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new ValidationError('All fields are required');
  }

  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ValidationError('Email already registered');

  let referredBy;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (referrer) referredBy = referrer._id;
  }

  const { token, hashedToken, expires } = generateVerificationToken();

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    referredBy,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: expires,
  });

  await sendVerificationEmail(email, token);
  sendTokenResponse(user, 201, res);
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, twoFactorCode } = req.body;

  const user = await User.findOne({ email }).select('+password +twoFactorSecret');
  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.twoFactorEnabled) {
    if (!twoFactorCode) {
      return res.status(200).json({ success: true, requires2FA: true });
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token: twoFactorCode,
      window: 1,
    });
    if (!verified) throw new UnauthorizedError('Invalid 2FA code');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.cookie('refreshToken', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).populate('recentlyViewed');
  res.json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, phone, preferredLanguage, preferredCurrency } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { firstName, lastName, phone, preferredLanguage, preferredCurrency },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
});

export const verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const hashedToken = hashToken(req.body.token);
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) throw new ValidationError('Invalid or expired verification token');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully' });
});

export const resendVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).select('+emailVerificationToken +emailVerificationExpires');
  if (user!.isEmailVerified) throw new ValidationError('Email already verified');

  const { token, hashedToken, expires } = generateVerificationToken();
  user!.emailVerificationToken = hashedToken;
  user!.emailVerificationExpires = expires;
  await user!.save();

  await sendVerificationEmail(user!.email, token);
  res.json({ success: true, message: 'Verification email sent' });
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordResetToken +passwordResetExpires');
  if (!user) {
    return res.json({ success: true, message: 'If email exists, reset link has been sent' });
  }

  const { token, hashedToken, expires } = generateVerificationToken();
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail(user.email, token);
  res.json({ success: true, message: 'If email exists, reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const hashedToken = hashToken(req.body.token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires +password');

  if (!user) throw new ValidationError('Invalid or expired reset token');

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

export const setup2FA = asyncHandler(async (req: AuthRequest, res: Response) => {
  const secret = speakeasy.generateSecret({ name: `NexShop (${req.user!.email})` });
  const user = await User.findById(req.user!._id).select('+twoFactorSecret');
  user!.twoFactorSecret = secret.base32;
  await user!.save();

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
  res.json({ success: true, secret: secret.base32, qrCode: qrCodeUrl });
});

export const enable2FA = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).select('+twoFactorSecret');
  const verified = speakeasy.totp.verify({
    secret: user!.twoFactorSecret!,
    encoding: 'base32',
    token: req.body.code,
    window: 1,
  });

  if (!verified) throw new ValidationError('Invalid verification code');

  user!.twoFactorEnabled = true;
  await user!.save();
  res.json({ success: true, message: '2FA enabled successfully' });
});

export const disable2FA = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).select('+twoFactorSecret +password');
  if (!(await user!.comparePassword(req.body.password))) {
    throw new UnauthorizedError('Invalid password');
  }

  user!.twoFactorEnabled = false;
  user!.twoFactorSecret = undefined;
  await user!.save();
  res.json({ success: true, message: '2FA disabled successfully' });
});

export const addAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (req.body.isDefault) {
    user!.addresses.forEach((a) => (a.isDefault = false));
  }
  user!.addresses.push(req.body);
  await user!.save();
  res.status(201).json({ success: true, addresses: user!.addresses });
});

export const updateAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);
  const address = user!.addresses.find((a) => a._id?.toString() === req.params.addressId);
  if (!address) throw new NotFoundError('Address not found');

  Object.assign(address, req.body);
  if (req.body.isDefault) {
    user!.addresses.forEach((a) => {
      if (a._id?.toString() !== req.params.addressId) a.isDefault = false;
    });
  }
  await user!.save();
  res.json({ success: true, addresses: user!.addresses });
});

export const deleteAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);
  user!.addresses = user!.addresses.filter((a) => a._id?.toString() !== req.params.addressId);
  await user!.save();
  res.json({ success: true, addresses: user!.addresses });
});

export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) throw new UnauthorizedError('Refresh token required');

  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) throw new UnauthorizedError('Invalid refresh token');
    sendTokenResponse(user, 200, res);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
});
