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

Router.get(
    '/organizer/status',
    apiLimiterHandler,
    auth,
    authorize.isOrganizer,
    userController.getOrganizerStatus
);

Router.get('/tickets', apiLimiterHandler, auth, userController.getUserTickets);
Router.get('/interested-events', auth, userController.getInterestedEvents);
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
