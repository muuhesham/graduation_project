import express from 'express';
import organizerDashboardController from '../controllers/organizerDashboardController.js';
import authorize from '../middlewares/authorize.js';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import organizerValidation from '../validations/organizerValidation.js';
import { upload } from '../middlewares/upload.js';

const Router = express.Router();

Router.get('/stats', auth, authorize.isOrganizer, organizerDashboardController.getStats);
Router.get('/analytics', auth, authorize.isOrganizer, organizerDashboardController.getAnalytics);

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

Router.post(
    '/phone/otp',
    auth,
    authorize.isOrganizer,
    organizerDashboardController.requestPhoneOtp
);

Router.post(
    '/phone/verify',
    auth,
    authorize.isOrganizer,
    organizerValidation.verifyPhoneOtp,
    validate,
    organizerDashboardController.verifyPhoneOtp
);

export default Router;
