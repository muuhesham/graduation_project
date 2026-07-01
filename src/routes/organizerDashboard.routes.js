import express from 'express';
import organizerDashboardController from '../controllers/organizerDashboardController.js';
import authorize from '../middlewares/authorize.js';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import organizerValidation from '../validations/organizerValidation.js';
import { upload } from '../middlewares/upload.js';

const Router = express.Router();

/**
 * @openapi
 * /api/v1/organizer/dashboard/stats:
 *   get:
 *     summary: Get organizer stats
 *     tags: [Organizer Dashboard]
 *     responses:
 *       200:
 *         description: Organizer stats
 */
Router.get('/stats', auth, authorize.isOrganizer, organizerDashboardController.getStats);

/**
 * @openapi
 * /api/v1/organizer/dashboard/analytics:
 *   get:
 *     summary: Get organizer analytics
 *     tags: [Organizer Dashboard]
 *     responses:
 *       200:
 *         description: Organizer analytics
 */
Router.get('/analytics', auth, authorize.isOrganizer, organizerDashboardController.getAnalytics);

/**
 * @openapi
 * /api/v1/organizer/dashboard/settings:
 *   patch:
 *     summary: Update organizer settings
 *     tags: [Organizer Dashboard]
 *     responses:
 *       200:
 *         description: Settings updated
 */
Router.patch(
    '/settings',
    auth,
    authorize.isOrganizer,
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ]),
    organizerValidation.updateSettings,
    validate,
    organizerDashboardController.updateSettings
);

/**
 * @openapi
 * /api/v1/organizer/dashboard/phone/otp:
 *   post:
 *     summary: Request phone OTP
 *     tags: [Organizer Dashboard]
 *     responses:
 *       200:
 *         description: OTP sent
 */
Router.post(
    '/phone/otp',
    auth,
    authorize.isOrganizer,
    organizerDashboardController.requestPhoneOtp
);

/**
 * @openapi
 * /api/v1/organizer/dashboard/phone/verify:
 *   post:
 *     summary: Verify phone OTP
 *     tags: [Organizer Dashboard]
 *     responses:
 *       200:
 *         description: Phone verified
 */
Router.post(
    '/phone/verify',
    auth,
    authorize.isOrganizer,
    organizerValidation.verifyPhoneOtp,
    validate,
    organizerDashboardController.verifyPhoneOtp
);

export default Router;
