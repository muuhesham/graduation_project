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
import optionalAuth from '../middlewares/optionalAuth.js';

const Router = express.Router();

Router.get(
    '/:id',
    publicLimiter,
    optionalAuth,
    organizerValidation.organizerIdParam,
    validate,
    organizerController.getPublicProfile
);

// CRUD OPERATIONS FOR ORGANIZER EVENTS

Router.post(
    '/events',
    publicLimiter,
    auth,
    assertMultipart,
    authorize.isOrganizer,
    upload.single('banner'),
    parseJsonFields([
        'location',
        'tickets',
        'sessions',
        'eventRules',
        'tags',
        'priceTiers',
        'seatsData',
    ]),
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
    parseJsonFields(['location', 'tickets', 'sessions', 'eventRules', 'tags']),
    organizerValidation.updateEvent,
    validate,
    organizerController.updateEvent
);

Router.delete(
    '/events/:eventId',
    publicLimiter,
    auth,
    authorize.isOrganizer,
    organizerValidation.deleteEvent,
    validate,
    organizerController.deleteEvent
);

Router.get('/events', auth, authorize.isOrganizer, organizerController.listEvents);

Router.patch(
    '/events/:eventId',
    auth,
    authorize.isOrganizer,
    organizerValidation.cancelEvent,
    validate,
    organizerController.cancelEvent
);

export default Router;
