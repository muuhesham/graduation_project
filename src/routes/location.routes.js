//@ts-check

import { Router } from 'express';

import locationController from './../controllers/locationController.js';
import locationValidation from './../validations/locationValidation.js';

import { publicLimiter } from './../middlewares/rateLimiter.js';
import validate from './../middlewares/validate.js';

/** @type {Router} */
const router = Router();

router.use(publicLimiter);

router.get('/countries', locationController.getAllCountries);

router.get(
    '/countries/:countryId/phone-code',
    locationValidation.getCountryPhoneCode,
    validate,
    locationController.getCountryPhoneCode
);

router.get(
    '/countries/:countryId/states',
    locationValidation.getStates,
    validate,
    locationController.getStates
);

router.get(
    '/states/:stateId/cities',
    locationValidation.getCitiesByStateId,
    validate,
    locationController.getCitiesByStateId
);

router.get(
    '/cities/:cityId',
    locationValidation.getCityById,
    validate,
    locationController.getCityById
);

export default router;
