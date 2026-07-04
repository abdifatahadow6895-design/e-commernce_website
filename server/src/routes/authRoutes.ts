import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { authRateLimiter } from '../middleware/security.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/authValidators.js';
import * as auth from '../controllers/authController.js';
import { generateToken, generateRefreshToken } from '../services/tokenService.js';
import type { IUser } from '../models/User.js';

const router = Router();

const oauthSuccessRedirect = (req: import('express').Request, res: import('express').Response) => {
  const user = req.user as IUser;
  const token = generateToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax' as const,
  };

  res
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
    .redirect(`${config.clientUrl}/auth/callback?success=1`);
};

if (config.google.clientId) {
  passport.use(
    new GoogleStrategy(
      { clientID: config.google.clientId, clientSecret: config.google.clientSecret, callbackURL: config.google.callbackUrl },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });
            if (user) {
              user.googleId = profile.id;
              await user.save();
            } else {
              user = await User.create({
                firstName: profile.name?.givenName || 'User',
                lastName: profile.name?.familyName || '',
                email: profile.emails?.[0]?.value,
                googleId: profile.id,
                isEmailVerified: true,
                avatar: profile.photos?.[0]?.value,
              });
            }
          }
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

if (config.github.clientId) {
  passport.use(
    new GitHubStrategy(
      { clientID: config.github.clientId, clientSecret: config.github.clientSecret, callbackURL: config.github.callbackUrl },
      async (_accessToken: string, _refreshToken: string, profile: { id: string; emails?: { value: string }[]; displayName?: string; photos?: { value: string }[] }, done: (err: Error | null, user?: unknown) => void) => {
        try {
          let user = await User.findOne({ githubId: profile.id });
          if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });
            if (user) {
              user.githubId = profile.id;
              await user.save();
            } else {
              const names = (profile.displayName || 'User').split(' ');
              user = await User.create({
                firstName: names[0],
                lastName: names.slice(1).join(' ') || '',
                email: profile.emails?.[0]?.value,
                githubId: profile.id,
                isEmailVerified: true,
                avatar: profile.photos?.[0]?.value,
              });
            }
          }
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

router.post('/register', authRateLimiter, registerValidator, validate, auth.register);
router.post('/login', authRateLimiter, loginValidator, validate, auth.login);
router.post('/logout', auth.logout);
router.post('/refresh', auth.refreshToken);
router.get('/me', protect, auth.getMe);
router.put('/profile', protect, auth.updateProfile);
router.post('/verify-email', auth.verifyEmail);
router.post('/resend-verification', protect, auth.resendVerification);
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, validate, auth.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, auth.resetPassword);
router.post('/2fa/setup', protect, auth.setup2FA);
router.post('/2fa/enable', protect, auth.enable2FA);
router.post('/2fa/disable', protect, auth.disable2FA);
router.post('/addresses', protect, auth.addAddress);
router.put('/addresses/:addressId', protect, auth.updateAddress);
router.delete('/addresses/:addressId', protect, auth.deleteAddress);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${config.clientUrl}/login?error=oauth` }), oauthSuccessRedirect);

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${config.clientUrl}/login?error=oauth` }), oauthSuccessRedirect);

export default router;
