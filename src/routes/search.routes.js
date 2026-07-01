// @ts-check

import { Router } from 'express';

import searchController from './../controllers/searchController.js';
import searchValidation from '../validations/searchValidation.js';

import { apiLimiter } from './../middlewares/rateLimiter.js';
import validate from './../middlewares/validate.js';

const router = Router();

/**
 * @openapi
 * /api/v1/search:
 *   get:
 *     summary: Search for events
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: organizerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: hasSeatMap
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', apiLimiter, searchValidation.search, validate, searchController.search);

export default router;
