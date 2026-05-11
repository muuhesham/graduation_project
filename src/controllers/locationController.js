//@ts-check

import asyncWrapper from './../middlewares/asyncWrapper.js';
import { sendSuccess } from './../utils/response.js';

import locationService from '../services/locationService.js';

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 *
 * @typedef {import('./../services/locationService').default} LocationService
 */

class LocationController {
    /** @type {LocationService} */
    #locationService;

    /**
     * @param {LocationService} locationService
     */
    constructor(locationService) {
        this.#locationService = locationService;
    }

    getAllCountries = asyncWrapper(
        /**
         * @route GET /api/v1/location/countries
         * @param {Request} req
         * @param {Response} res
         * @return {Promise<void>}
         */
        async (req, res) => {
            const supported =
                req.query.supported === 'true'
                    ? true
                    : req.query.supported === 'false'
                      ? false
                      : undefined;

            const countries = await this.#locationService.getAllCountries({ supported });
            return sendSuccess(res, countries);
        }
    );

    getCountryPhoneCode = asyncWrapper(
        /**
         * @route GET /api/v1/location/:countryId/phone-code
         * @param {Request} req
         * @param {Response} res
         * @return {Promise<void>}
         */
        async (req, res) => {
            const countryId = Number(req.params.countryId);
            const country = await this.#locationService.findCountryById(countryId);
            if (!country) {
                return sendSuccess(res, {}, 404);
            }
            return sendSuccess(res, {
                flagEmoji: country?.flagEmoji,
                phoneCode: country?.phoneCode,
            });
        }
    );

    getStates = asyncWrapper(
        /**
         * @route GET /api/v1/location/countries/:countryId/states
         * @param {Request} req
         * @param {Response} res
         * @return {Promise<void>}
         */
        async (req, res) => {
            const countryId = Number(req.params.countryId);
            const states = await this.#locationService.getStatesByCountryId(countryId);
            return sendSuccess(res, states);
        }
    );

    getCitiesByStateId = asyncWrapper(
        /**
         * @route GET /api/v1/location/states/:stateId/cities
         * @param {Request} req
         * @param {Response} res
         * @return {Promise<void>}
         */
        async (req, res) => {
            const stateId = Number(req.params.stateId);
            const cities = await this.#locationService.getCitiesByStateId(stateId);
            return sendSuccess(res, cities);
        }
    );

    getCityById = asyncWrapper(
        /**
         * @route GET /api/v1/location/cities/:cityId
         * @param {Request} req
         * @param {Response} res
         * @return {Promise<void>}
         */
        async (req, res) => {
            const cityId = Number(req.params.cityId);
            const city = await this.#locationService.findCityById(cityId);
            return sendSuccess(res, city);
        }
    );
}

export default new LocationController(locationService);
