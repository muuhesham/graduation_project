// @ts-check

import { Router } from 'express';

import searchController from './../controllers/searchController.js';
import searchValidation from '../validations/searchValidation.js';

import { apiLimiter } from './../middlewares/rateLimiter.js';
import validate from './../middlewares/validate.js';

const router = Router();

/**
 * @param {string} q - Search query (2-200 characters, required)
 * @param {number} [page=1] - Page number for pagination. Default is `1`
 * @param {number} [limit=10] - Results per page (1-50, default 10). Default is `10`
 * @param {number} [categoryId] - Optional category filter
 * @param {string} [organizerId] - Optional organizer filter
 * @param {number} [minPrice] - Optional minimum ticket price
 * @param {number} [maxPrice] - Optional maximum ticket price
 * @param {boolean} [hasSeatMap] - Optional seat-map filter
 * @param {string | string[]} [tag] - Optional tag filter; can be repeated
 * @param {string | string[]} [tags] - Optional comma-separated or repeated tag filter
 * @route GET /api/v1/search
 * @middleware searchValidation.search
 * @middleware validate
 * @middleware apiLimiter
 * @handler searchController.search
 */
router.get('/search', apiLimiter, searchValidation.search, validate, searchController.search);

export default router;
