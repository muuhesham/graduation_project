import { prisma as prismaClient } from '../config/db.js';
import cacheService from './cacheService.js';

const locationService = {
    COUNTRIES_CACHE_KEY: 'countries:all',
    SUPPORTED_COUNTRIES_CACHE_KEY: 'countries:supported',
    LOCATION_CACHE_TTL: 60 * 60 * 24,

    async getAllCountries({ supported } = {}) {
        const isSupportedFilter = supported === true ? true : supported === false ? false : null;
        const cacheKey =
            isSupportedFilter === true
                ? locationService.SUPPORTED_COUNTRIES_CACHE_KEY
                : isSupportedFilter === false
                  ? 'countries:unsupported'
                  : locationService.COUNTRIES_CACHE_KEY;

        return cacheService.remember(
            cacheKey,
            () => {
                return prismaClient.country.findMany({
                    where: isSupportedFilter !== null ? { isSupported: isSupportedFilter } : {},
                    orderBy: { name: 'asc' },
                });
            },
            locationService.LOCATION_CACHE_TTL
        );
    },

    async findCountryById(id) {
        return prismaClient.country.findUnique({
            where: { id },
        });
    },

    async getStatesByCountryId(countryId) {
        return prismaClient.state.findMany({
            where: { countryId },
            orderBy: { name: 'asc' },
        });
    },

    async findStateById(id) {
        return prismaClient.state.findUnique({
            where: { id },
        });
    },

    async getCitiesByStateId(stateId) {
        return prismaClient.city.findMany({
            where: { stateId },
            orderBy: { name: 'asc' },
        });
    },

    async findCityById(id) {
        return prismaClient.city.findUnique({
            where: { id },
        });
    },

    async findCityByName(name) {
        return prismaClient.city.findFirst({
            where: { name },
        });
    },
};

export default locationService;
