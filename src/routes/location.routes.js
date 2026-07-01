//@ts-check

import { Router } from 'express';

import locationController from './../controllers/locationController.js';
import locationValidation from './../validations/locationValidation.js';

import { publicLimiter } from './../middlewares/rateLimiter.js';
import validate from './../middlewares/validate.js';

/** @type {Router} */
const router = Router();

router.use(publicLimiter);

/**
 * @openapi
 * /api/v1/countries:
 *   get:
 *     summary: List all countries
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: List of countries
 */
router.get('/countries', locationController.getAllCountries);

/**
 * @openapi
 * /api/v1/countries/{countryId}/phone-code:
 *   get:
 *     summary: Get country phone code
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Country phone code
 */
router.get(
    '/countries/:countryId/phone-code',
    locationValidation.getCountryPhoneCode,
    validate,
    locationController.getCountryPhoneCode
);

/**
 * @openapi
 * /api/v1/countries/{countryId}/states:
 *   get:
 *     summary: Get states by country ID
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of states
 */
router.get(
    '/countries/:countryId/states',
    locationValidation.getStates,
    validate,
    locationController.getStates
);

/**
 * @openapi
 * /api/v1/states/{stateId}/cities:
 *   get:
 *     summary: Get cities by state ID
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of cities
 */
router.get(
    '/states/:stateId/cities',
    locationValidation.getCitiesByStateId,
    validate,
    locationController.getCitiesByStateId
);

/**
 * @openapi
 * /api/v1/cities/{cityId}:
 *   get:
 *     summary: Get city by ID
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: City details
 */
router.get(
    '/cities/:cityId',
    locationValidation.getCityById,
    validate,
    locationController.getCityById
);

export default router;
