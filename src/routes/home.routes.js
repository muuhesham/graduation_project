import express from 'express';
import { publicLimiter } from '../middlewares/rateLimiter.js';
import homeController from '../controllers/homeController.js';
import optionalAuth from '../middlewares/optionalAuth.js';

const Router = express.Router();

/**
 * @openapi
 * /api/v1/home/latest-events:
 *   get:
 *     summary: Get latest events
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: List of latest events
 */
Router.get('/latest-events', publicLimiter, optionalAuth, homeController.latestEvents);

/**
 * @openapi
 * /api/v1/home/new-events-this-week:
 *   get:
 *     summary: Get new events this week
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: List of new events this week
 */
Router.get('/new-events-this-week', publicLimiter, optionalAuth, homeController.newEventsThisWeek);

/**
 * @openapi
 * /api/v1/home/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: List of categories
 */
Router.get('/categories', publicLimiter, homeController.allCategories);

/**
 * @openapi
 * /api/v1/home/past-events:
 *   get:
 *     summary: Get past events and highlights
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: List of past events and highlights
 */
Router.get('/past-events', publicLimiter, optionalAuth, homeController.pastEventsAndHighlights);

/**
 * @openapi
 * /api/v1/home/nearby-events:
 *   get:
 *     summary: Get nearby events
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: List of nearby events
 */
Router.get('/nearby-events', publicLimiter, optionalAuth, homeController.nearbyEvents);

/**
 * @openapi
 * /api/v1/home/personalized-events:
 *   get:
 *     summary: Get personalized events
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: List of personalized events
 */
Router.get('/personalized-events', publicLimiter, optionalAuth, homeController.personalizedEvents);

export default Router;
