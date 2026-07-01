import express from "express";
import auth from "../middlewares/auth.js";
import profileController from "../controllers/profileController.js";
import profileValidations from "../validations/profileValidation.js";
import validate from "../middlewares/validate.js";
import { profileLimiter } from "../middlewares/rateLimiter.js";

const Router = express.Router();

/**
 * @openapi
 * /api/v1/profile:
 *   get:
 *     summary: Get my profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile details
 */
Router.get('/', auth, profileController.getMyProfile);

/**
 * @openapi
 * /api/v1/profile:
 *   patch:
 *     summary: Update my profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile updated
 */
Router.patch('/', auth, profileValidations.updateMyProfile, validate, profileLimiter, profileController.updateMyProfile);

/**
 * @openapi
 * /api/v1/profile:
 *   delete:
 *     summary: Delete my profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile deleted
 */
Router.delete('/', auth, profileController.deleteMyProfile);

/**
 * @openapi
 * /api/v1/profile/change-password:
 *   patch:
 *     summary: Change password
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Password changed
 */
Router.patch('/change-password', auth, profileValidations.updatePassword, validate, profileLimiter, profileController.updatePassword);

/**
 * @openapi
 * /api/v1/profile/change-email:
 *   patch:
 *     summary: Change email
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Email changed
 */
Router.patch('/change-email', auth, profileValidations.updateEmail, validate, profileLimiter, profileController.updateEmail);

/**
 * @openapi
 * /api/v1/profile/confirm-email:
 *   get:
 *     summary: Confirm email update
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Email confirmed
 */
Router.get('/confirm-email', profileValidations.confirmEmail, validate, profileController.confirmEmailUpdate);

/**
 * @openapi
 * /api/v1/profile/attended-events:
 *   get:
 *     summary: Get attended events
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: List of attended events
 */
Router.get('/attended-events', auth, profileController.getAttendEvents);

/**
 * @openapi
 * /api/v1/profile/preferences:
 *   get:
 *     summary: Get preferences
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: User preferences
 */
Router.get('/preferences', auth, profileController.getPreferences);

/**
 * @openapi
 * /api/v1/profile/change-preferences:
 *   patch:
 *     summary: Change preferences
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Preferences changed
 */
Router.patch('/change-preferences', auth, profileValidations.updatePreferences, validate, profileController.updatePreferences);

export default Router;