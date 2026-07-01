import express from 'express';

import authController from '../controllers/authController.js';
import { googleAuthController } from '../controllers/authController.js';

import authValidations from '../validations/authValidation.js';
import validate from '../middlewares/validate.js';
import auth from '../middlewares/auth.js';

import {
    authLimiter,
    emailLimiter,
    refreshLimiter,
    requestResetLimiter,
} from '../middlewares/rateLimiter.js';

const Router = express.Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: User register
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Register successful
 */
Router.post('/register', authLimiter, authValidations.register, validate, authController.register);

/**
 * @openapi
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify user OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
Router.post(
    '/verify-otp',
    authLimiter,
    auth,
    authValidations.verifyOtp,
    validate,
    authController.verifyOtp
);

/**
 * @openapi
 * /api/v1/auth/resend-otp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP resent successfully
 */
Router.post('/resend-otp', emailLimiter, auth, authController.resendOtp);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
Router.post('/login', authLimiter, authValidations.login, validate, authController.login);

/**
 * @openapi
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
Router.post(
    '/refresh-token',
    refreshLimiter,
    authValidations.refreshToken,
    validate,
    authController.refreshToken
);

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent
 */
Router.post(
    '/forgot-password',
    requestResetLimiter,
    authValidations.forgetPassword,
    validate,
    authController.requestResetPassword
);

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, token]
 *             properties:
 *               password:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
Router.post(
    '/reset-password',
    requestResetLimiter,
    authValidations.resetPassword,
    validate,
    authController.resetPassword
);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
Router.post('/logout', auth, authValidations.logout, validate, authController.logout);

Router.get('/google/url', authLimiter, googleAuthController.getAuthUrl);

Router.get('/google/callback', googleAuthController.handleCallback);

/**
 * @openapi
 * /api/v1/auth/phone/request-otp:
 *   post:
 *     summary: Request phone OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber]
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP requested successfully
 */
Router.post(
    '/phone/request-otp',
    authLimiter,
    auth,
    authValidations.requestPhoneOtp,
    validate,
    authController.requestPhoneOtp
);

/**
 * @openapi
 * /api/v1/auth/phone/verify-otp:
 *   post:
 *     summary: Verify phone OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, otp]
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phone OTP verified successfully
 */
Router.post(
    '/phone/verify-otp',
    authLimiter,
    auth,
    authValidations.verifyPhoneOtp,
    validate,
    authController.verifyPhoneOtp
);

export default Router;
