//@ts-check
import express from 'express';
import userController from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import { apiLimiter, emailLimiter } from '../middlewares/rateLimiter.js';
import { upload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import userValidation from './../validations/userValidation.js';

const Router = express.Router();
const apiLimiterHandler = /** @type {import('express').RequestHandler} */ (apiLimiter);
const emailLimiterHandler = /** @type {import('express').RequestHandler} */ (emailLimiter);

Router.patch(
    '/upgrade-to-organizer',
    apiLimiterHandler,
    auth,
    upload.single('officialDocument'),
    userValidation.upgradeToOrganizer,
    validate,
    userController.upgradeToOrganizer
);

Router.patch(
    '/organizer/contact-email/send',
    emailLimiterHandler,
    auth,
    authorize.isOrganizer,
    userValidation.sendOrganizerContactEmailVerification,
    validate,
    userController.sendOrganizerContactEmailVerification
);

Router.patch(
    '/organizer/contact-email/resend',
    emailLimiterHandler,
    auth,
    authorize.isOrganizer,
    userValidation.resendOrganizerContactEmailVerification,
    validate,
    userController.resendOrganizerContactEmailVerification
);

Router.patch(
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
Router.get('/wallet', apiLimiter, auth, userController.checkWallet);

export default Router;
