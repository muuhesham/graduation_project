import express from 'express';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { publicLimiter } from '../middlewares/rateLimiter.js';
import reviewValidation from '../validations/reviewValidation.js';
import reviewController from '../controllers/reviewController.js';

const Router = express.Router();

/**
 * @openapi
 * /api/v1/reviews/{eventId}:
 *   post:
 *     summary: Create a review for an event
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Review created
 */
Router.post('/:eventId', auth, reviewValidation.create, validate, reviewController.create);

/**
 * @openapi
 * /api/v1/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review updated
 */
Router.put('/:id', auth, reviewValidation.update, validate, reviewController.update);

/**
 * @openapi
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */
Router.delete('/:id', auth, reviewValidation.delete, validate, reviewController.delete);

/**
 * @openapi
 * /api/v1/reviews/{eventId}:
 *   get:
 *     summary: Get reviews for an event
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
Router.get('/:eventId', publicLimiter, reviewValidation.getByEventId, validate, reviewController.getByEventId);

/**
 * @openapi
 * /api/v1/reviews/{eventId}/my-review:
 *   get:
 *     summary: Get my review for an event
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 */
Router.get('/:eventId/my-review', auth, reviewValidation.getUserEventReview, validate, reviewController.getUserEventReview);

export default Router;
