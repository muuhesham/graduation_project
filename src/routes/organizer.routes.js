import express from 'express';
import organizerController from '../controllers/organizerController.js';
import organizerValidation from '../validations/organizerValidation.js';
import validate from '../middlewares/validate.js';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import { publicLimiter } from '../middlewares/rateLimiter.js';
import assertMultipart from '../middlewares/assertMultipart.js';
import { upload } from '../middlewares/upload.js';
import parseJsonFields from '../middlewares/parseJson.js';

const Router = express.Router();

Router.post(
    '/events',
    publicLimiter,
    auth,
    assertMultipart,
    authorize.isOrganizer,
    upload.single('banner'),
    parseJsonFields(['location', 'tickets', 'sessions']),
    organizerValidation.createEvent,
    validate,
    organizerController.createEvent
);

Router.put(
    '/events/:eventId',
    publicLimiter,
    auth,
    authorize.isOrganizer,
    assertMultipart,
    upload.single('banner'),
    parseJsonFields(['location', 'tickets', 'sessions']),
    organizerValidation.updateEvent,
    validate,
    organizerController.updateEvent
);

Router.delete(
    '/events/:eventId',
    publicLimiter,
    auth,
    authorize.isOrganizer,
    organizerController.deleteEvent
);
//Router.get('/events', publicLimiter, authorize.isOrganizer, organizerController.listEvents);
//Router.get('/events/:eventId/registrations', publicLimiter, authorize.isOrganizer, organizerController.listRegistrations);
//Router.put('/registrations/:registrationId', publicLimiter, authorize.isOrganizer, organizerController.manageRegistration);

export default Router;
