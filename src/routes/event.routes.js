import express from 'express';
import validate from '../middlewares/validate.js';
import auth from '../middlewares/auth.js';
import { paymentLimiter, availabilityLimiter, reserveLimiter } from '../middlewares/rateLimiter.js';
import eventValidation from '../validations/eventValidation.js';
import eventController from '../controllers/eventController.js';
import { publicLimiter } from '../middlewares/rateLimiter.js';
import optionalAuth from '../middlewares/optionalAuth.js';

const Router = express.Router();

/**
 * @openapi
 * /api/v1/events/tags:
 *   get:
 *     summary: Get all event tags
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of tags retrieved successfully
 */
Router.get('/tags', publicLimiter, eventController.getAllTags);

/**
 * @openapi
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 */
Router.get('/:id', optionalAuth, eventValidation.show, validate, eventController.show);

/**
 * @openapi
 * /api/v1/events/{id}/availability:
 *   get:
 *     summary: Get event availability
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
 */
Router.get(
    '/:id/availability',
    availabilityLimiter,
    eventValidation.show,
    validate,
    eventController.availability
);

/**
 * @openapi
 * /api/v1/events/{id}/checkout:
 *   post:
 *     summary: Checkout event tickets
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tickets]
 *             properties:
 *               tickets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ticketTypeId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Checkout successful
 */
Router.post(
    '/:id/checkout',
    paymentLimiter,
    auth,
    eventValidation.checkout,
    validate,
    eventController.checkout
);

/**
 * @openapi
 * /api/v1/events/{id}/interested:
 *   post:
 *     summary: Mark event as interested
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event marked as interested
 */
Router.post('/:id/interested', auth, eventValidation.addToInterested, validate, eventController.addToInterested);

/**
 * @openapi
 * /api/v1/events/{id}/interested:
 *   delete:
 *     summary: Remove event from interested
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event removed from interested
 */
Router.delete('/:id/interested', auth, eventValidation.removeFromInterested, validate, eventController.removeFromInterested);

/**
 * @openapi
 * /api/v1/events/{id}/reserve:
 *   post:
 *     summary: Reserve event tickets
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tickets]
 *             properties:
 *               tickets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ticketTypeId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Reservation successful
 */
Router.post(
    '/:id/reserve',
    auth,
    reserveLimiter,
    eventValidation.reserve,
    validate,
    eventController.reserve
);


export default Router;
