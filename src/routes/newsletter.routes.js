import express from 'express';
import { subscribeLimiter, confirmLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { newsletterController } from '../controllers/newsletterController.js';
import newsletterValidations from '../validations/newsletterValidations.js';

const Router = express.Router();

/**
 * @openapi
 * /api/v1/newsletter/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Newsletter]
 *     responses:
 *       200:
 *         description: Subscription successful
 */
Router.post(
    '/subscribe',
    subscribeLimiter,
    newsletterValidations.subscribe,
    validate,
    newsletterController.subscribe
);

/**
 * @openapi
 * /api/v1/newsletter/confirm/{token}:
 *   get:
 *     summary: Confirm newsletter subscription
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription confirmed
 */
Router.get(
    '/confirm/:token',
    confirmLimiter,
    newsletterValidations.confirm,
    validate,
    newsletterController.confirmSubscription
);

/**
 * @openapi
 * /api/v1/newsletter/confirm:
 *   post:
 *     summary: Confirm newsletter subscription (JSON)
 *     tags: [Newsletter]
 *     responses:
 *       200:
 *         description: Subscription confirmed
 */
Router.post(
    '/confirm',
    confirmLimiter,
    newsletterValidations.confirmBody,
    validate,
    newsletterController.confirmSubscriptionJSON
);

export default Router;
