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

/**
 * @openapi
 * /api/v1/organizer/events:
 *   get:
 *     summary: List organizer events
 *     tags: [Organizer]
 *     responses:
 *       200:
 *         description: List of events
 */
Router.get('/events', auth, authorize.isOrganizer, organizerController.listEvents);

/**
 * @openapi
 * /api/v1/organizer/events:
 *   post:
 *     summary: Create an event
 *     tags: [Organizer]
 *     responses:
 *       201:
 *         description: Event created
 */
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

/**
 * @openapi
 * /api/v1/organizer/events/{eventId}:
 *   put:
 *     summary: Update an event
 *     tags: [Organizer]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event updated
 */
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

/**
 * @openapi
 * /api/v1/organizer/events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Organizer]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 */
Router.delete(
    '/events/:eventId',
    publicLimiter,
    auth,
    authorize.isOrganizer,
    organizerValidation.deleteEvent,
    validate,
    organizerController.deleteEvent
);

/**
 * @openapi
 * /api/v1/organizer/events/{eventId}:
 *   patch:
 *     summary: Cancel an event
 *     tags: [Organizer]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event cancelled
 */
Router.patch(
    '/events/:eventId',
    auth,
    authorize.isOrganizer,
    organizerValidation.cancelEvent,
    validate,
    organizerController.cancelEvent
);

/**
 * @openapi
 * /api/v1/organizer/{id}:
 *   get:
 *     summary: Get organizer public profile
 *     tags: [Organizer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organizer profile
 */
Router.get(
    '/:id',
    publicLimiter,
    optionalAuth,
    organizerValidation.organizerIdParam,
    validate,
    organizerController.getPublicProfile
);

/**
 * @openapi
 * /api/v1/organizer/{id}/follow:
 *   post:
 *     summary: Follow an organizer
 *     tags: [Organizer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow successful
 */
Router.post(
    '/:id/follow',
    auth,
    organizerValidation.organizerIdParam,
    validate,
    organizerController.follow
);

/**
 * @openapi
 * /api/v1/organizer/{id}/unfollow:
 *   delete:
 *     summary: Unfollow an organizer
 *     tags: [Organizer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unfollow successful
 */
Router.delete(
    '/:id/unfollow',
    auth,
    organizerValidation.organizerIdParam,
    validate,
    organizerController.unfollow
);

export default Router;
