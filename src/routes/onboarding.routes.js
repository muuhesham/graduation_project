import express from 'express';
import { onboardingWriteLimiter, statusLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import auth from '../middlewares/auth.js';
import { onboardingController } from '../controllers/onboardingController.js';
import onboardingValidations from '../validations/onboardingValidation.js';

const Router = express.Router();

/**
 * @openapi
 * /api/v1/onboarding/status:
 *   get:
 *     summary: Get onboarding status
 *     tags: [Onboarding]
 *     responses:
 *       200:
 *         description: Onboarding status
 */
Router.get('/status', statusLimiter, auth, onboardingController.getStatus);

/**
 * @openapi
 * /api/v1/onboarding/basic:
 *   patch:
 *     summary: Update basic onboarding details
 *     tags: [Onboarding]
 *     responses:
 *       200:
 *         description: Basic details updated
 */
Router.patch(
    '/basic',
    onboardingWriteLimiter,
    auth,
    onboardingValidations.updateBasic,
    validate,
    onboardingController.updateBasic
);

/**
 * @openapi
 * /api/v1/onboarding/preferences:
 *   patch:
 *     summary: Update onboarding preferences
 *     tags: [Onboarding]
 *     responses:
 *       200:
 *         description: Preferences updated
 */
Router.patch(
    '/preferences',
    onboardingWriteLimiter,
    auth,
    onboardingValidations.updatePreferences,
    validate,
    onboardingController.updatePreferences
);

/**
 * @openapi
 * /api/v1/onboarding/location:
 *   patch:
 *     summary: Update onboarding location
 *     tags: [Onboarding]
 *     responses:
 *       200:
 *         description: Location updated
 */
Router.patch(
    '/location',
    onboardingWriteLimiter,
    auth,
    onboardingValidations.updateLocation,
    validate,
    onboardingController.updateLocation
);

export default Router;
