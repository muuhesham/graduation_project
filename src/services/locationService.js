//@ts-check

import { prisma as prismaClient } from './../config/db.js';
import cacheService from './cacheService.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 * @typedef {import('@prisma/client').Country} Country
 * @typedef {import('@prisma/client').State} State
 * @typedef {import('@prisma/client').City} City
 *
 * @typedef {typeof import('./cacheService.js').default} CacheService
 *
 * @typedef {object} LocationServiceDeps
 * @property {PrismaClient} prismaClient
 * @property {CacheService} cacheService
 *
 * @typedef {object} GetAllCountriesOptions
 * @property {boolean} [supported]
 */

class LocationService {
    /** @type {PrismaClient} */
    #prismaClient;

    /** @type {CacheService} */
    #cacheService;

    /** @type {string} */
    #COUNTRIES_CACHE_KEY = 'countries:all';
    /** @type {string} */
    #SUPPORTED_COUNTRIES_CACHE_KEY = 'countries:supported';
    /** @type {number} */
    #LOCATION_CACHE_TTL = 60 * 60 * 24; // 24 hours

    /**
     * @param {LocationServiceDeps} deps
     */
    constructor({ prismaClient, cacheService }) {
        this.#prismaClient = prismaClient;
        this.#cacheService = cacheService;
    }

    /**
     * @param {GetAllCountriesOptions} options
     * @returns {Promise<Country[]>}
     */
    getAllCountries({ supported } = {}) {
        const isSupportedFilter = supported === true ? true : supported === false ? false : null;
        const cacheKey =
            isSupportedFilter === true
                ? this.#SUPPORTED_COUNTRIES_CACHE_KEY
                : isSupportedFilter === false
                  ? 'countries:unsupported'
                  : this.#COUNTRIES_CACHE_KEY;

        return this.#cacheService.remember(
            cacheKey,
            () => {
                return this.#prismaClient.country.findMany({
                    where: isSupportedFilter === null ? {} : { isSupported: isSupportedFilter },
                    orderBy: { name: 'asc' },
                });
            },
            this.#LOCATION_CACHE_TTL
        );
    }

    /**
     * @param {number} id
     * @returns {Promise<Country|null>}
     */
    findCountryById(id) {
        return this.#prismaClient.country.findUnique({ where: { id } });
    }

    /**
     * @param {number} countryId
     * @returns {Promise<State[]>}
     */
    getStatesByCountryId(countryId) {
        return this.#prismaClient.state.findMany({
            where: { countryId },
            orderBy: { name: 'asc' },
        });
    }

    /**
     * @param {number} id
     * @returns {Promise<State|null>}
     */
    findStateById(id) {
        return this.#prismaClient.state.findUnique({ where: { id } });
    }

    /**
     * @param {number} stateId
     * @returns {Promise<City[]>}
     */
    getCitiesByStateId(stateId) {
        return this.#prismaClient.city.findMany({
            where: { stateId },
            orderBy: { name: 'asc' },
        });
    }

    /**
     * @param {number} id
     * @returns {Promise<City|null>}
     */
    findCityById(id) {
        return this.#prismaClient.city.findUnique({ where: { id } });
    }

    /**
     * @param {string} name
     * @returns {Promise<City|null>}
     */
    findCityByName(name) {
        return this.#prismaClient.city.findFirst({ where: { name } });
    }
}

export default new LocationService({ prismaClient, cacheService });
