//@ts-check

import { param } from 'express-validator';
/**
 * @typedef {import('express-validator').ValidationChain} ValidationChain
 */

class LocationValidators {
    /**
     * @type {ValidationChain[]}
     */
    getCountryPhoneCode = [
        param('countryId').isInt().withMessage('countryId must be an integer').toInt(),
    ];

    /**
     * @type {ValidationChain[]}
     */
    getStates = [param('countryId').isInt().withMessage('countryId must be an integer').toInt()];

    /**
     * @type {ValidationChain[]}
     */
    getCitiesByStateId = [
        param('stateId').isInt().withMessage('stateId must be an integer').toInt(),
    ];

    /**
     * @type {ValidationChain[]}
     */
    getCityById = [param('cityId').isInt().withMessage('cityId must be an integer').toInt()];
}

export default new LocationValidators();
