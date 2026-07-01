//@ts-check

import express from 'express';

import userValidation from './../validations/userValidation.js';
import userController from '../controllers/userController.js';

import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import { apiLimiter, emailLimiter } from '../middlewares/rateLimiter.js';
import { upload } from '../middlewares/upload.js';

import assertMultipart from './../middlewares/assertMultipart.js';
import validate from '../middlewares/validate.js';

const Router = express.Router();
const apiLimiterHandler = /** @type {import('express').RequestHandler} */ (apiLimiter);
const emailLimiterHandler = /** @type {import('express').RequestHandler} */ (emailLimiter);

/**
 * @openapi
 * /api/v1/user/upgrade-to-organizer:
 *   patch:
 *     summary: Upgrade user to organizer
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upgrade request successful
 */
Router.patch(
    '/upgrade-to-organizer',
    apiLimiterHandler,
    assertMultipart,
    auth,
    upload.any(),
    userValidation.upgradeToOrganizer,
    validate,
    userController.upgradeToOrganizer
);

/**
 * @openapi
 * /api/v1/user/tickets:
 *   get:
 *     summary: Get user tickets
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User tickets retrieved
 */
Router.get('/tickets', apiLimiterHandler, auth, userController.getUserTickets);

/**
 * @openapi
 * /api/v1/user/interested-events:
 *   get:
 *     summary: Get interested events
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interested events retrieved
 */
Router.get('/interested-events', auth, userController.getInterestedEvents);

/**
 * @openapi
 * /api/v1/user/wallet:
 *   get:
 *     summary: Check user wallet
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet status retrieved
 */
Router.get('/wallet', apiLimiterHandler, auth, userController.checkWallet);

Router.post(
    '/organizers/:organizerId/follow',
    apiLimiterHandler,
    auth,
    userValidation.followOrganizer,
    validate,
    userController.followOrganizer
);

Router.post(
    '/organizers/:organizerId/unfollow',
    apiLimiterHandler,
    auth,
    userValidation.unfollowOrganizer,
    validate,
    userController.unfollowOrganizer
);

export default Router;
