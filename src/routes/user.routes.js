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
import { param } from 'express-validator';

const Router = express.Router();
const apiLimiterHandler = /** @type {import('express').RequestHandler} */ (apiLimiter);
const emailLimiterHandler = /** @type {import('express').RequestHandler} */ (emailLimiter);

Router.patch(
    '/upgrade-to-organizer',
    apiLimiterHandler,
    assertMultipart,
    auth,
    upload.single('officialDocument'),
    userValidation.upgradeToOrganizer,
    validate,
    userController.upgradeToOrganizer
);

Router.post(
    '/organizer/contact-email/resend',
    emailLimiterHandler,
    auth,
    authorize.isOrganizer,
    userValidation.resendOrganizerEmailOtp,
    validate,
    userController.resendOrganizerEmailOtp
);

Router.post(
    '/organizer/contact-email/verify',
    apiLimiterHandler,
    auth,
    authorize.isOrganizer,
    userValidation.verifyOrganizerContactEmail,
    validate,
    userController.verifyOrganizerContactEmail
);

Router.get('/tickets', apiLimiterHandler, auth, userController.getUserTickets);
Router.get('/interested-events', auth, userController.getInterestedEvents);
Router.get('/wallet', apiLimiterHandler, auth, userController.checkWallet);

Router.post(
    '/organizers/:organizerId/follow',
    apiLimiterHandler,
    auth,
    param('organizerId').isUUID().withMessage('Invalid organizer ID'),
    validate,
    userController.followOrganizer
);

Router.delete(
    '/organizers/:organizerId/follow',
    apiLimiterHandler,
    auth,
    param('organizerId').isUUID().withMessage('Invalid organizer ID'),
    validate,
    userController.unfollowOrganizer
);

export default Router;
