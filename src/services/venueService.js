import { prisma as prismaClient } from '../config/db.js';

import { venueRepository, governorateRepository } from './../repositories/index.js';
import GovernoratesNames from '../constants/enums/governoratesNames.js';

import NotFoundError from './../errors/NotFoundError.js';

import VenueErrors from './../constants/messages/errors/venue.js';
import GovernorateErrors from './../constants/messages/errors/governorate.js';

/**
 * @typedef {import('./../types/shared').TransactionClient} TransactionClient
 * @typedef {import('./../types/models').Venue} Venue
 * @typedef {import('./../types/models').VenueCreate} VenueCreate
 * @typedef {import('./../types/models').VenueUpdate} VenueUpdate
 * @typedef {import('./../types/models').VenueReadOptions} VenueReadOptions
 * @typedef {import('./../types/models').VenueProjection} VenueProjection
 * @typedef {import('./../types/models').VenuePaginatedResource} VenuePaginatedResource
 */

const venueService = {
    DEFAULT_EXCLUDE_FIELDS: {
        createdAt: true,
        updatedAt: true,
    },

    /**
     * @deprecated Use createRecord(data, tx) instead
     */
    async create(
        {
            name,
            address,
            city,
            country,
            state,
            zipCode = null,
            longitude,
            latitude,
            googlePlaceId = null,
        },
        tx = prismaClient
    ) {
        const normalized = state.replaceAll(' ', '_').toUpperCase();
        const governorate = await tx.governorate.findUnique({
            where: { name: normalized },
            select: { id: true },
        });

        const governorateId = governorate?.id;

        if (!governorateId) {
            return { message: 'Governorate not found' };
        }

        return await tx.venue.create({
            data: {
                name,
                address,
                city,
                country,
                zipCode,
                longitude: parseFloat(longitude),
                latitude: parseFloat(latitude),
                googlePlaceId,
                state,
                governorateId,
            },
        });
    },

    /**
     * @param {VenueCreate} data
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<Venue>}
     */
    async createRecord(data, tx = null) {
        const normalized =
            data?.state && typeof data.state === 'string'
                ? data.state.replaceAll(' ', '_').toUpperCase()
                : undefined;

        if (!normalized || !Object.prototype.hasOwnProperty.call(GovernoratesNames, normalized)) {
            throw new NotFoundError(undefined, undefined, [
                GovernorateErrors.INVALID_GOVERNORATE_NAME,
            ]);
        }

        const governorate = await governorateRepository.findOne(
            {
                where: { name: normalized },
            },
            tx
        );

        if (!governorate?.id) {
            throw new NotFoundError(undefined, undefined, [
                GovernorateErrors.GOVERNORATE_NOT_FOUND,
            ]);
        }

        return venueRepository.create(
            {
                ...data,
                latitude: data.latitude ? parseFloat(data.latitude) : undefined,
                longitude: data.longitude ? parseFloat(data.longitude) : undefined,
                governorateId: governorate.id,
            },
            tx
        );
    },

    /**
     * @param {VenueReadOptions} [options]
     * @returns {Promise<VenuePaginatedResource>}
     */
    getAll(options = {}) {
        return venueRepository.paginate(options);
    },

    /**
     * @deprecated Use updateRecord(id, data, tx) instead
     */
    async update(
        venueId,
        { name, address, city, country, zipCode, longitude, latitude, googlePlaceId, state },
        tx = prismaClient
    ) {
        const governorate = await tx.governorate.findUnique({
            where: { name: state.replaceAll(' ', '_').toUpperCase() },
            select: { id: true },
        });

        const governorateId = governorate?.id;

        if (!governorateId) {
            return { message: 'Governorate not found' };
        }

        return await tx.venue.update({
            where: { id: venueId },
            data: {
                name,
                address,
                city,
                country,
                zipCode,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                googlePlaceId,
                state,
                governorateId,
            },
        });
    },

    /**
     * @param {number} id
     * @param {VenueUpdate} data
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<Venue>}
     */
    async updateRecord(id, data, tx = null) {
        let governorateId;

        if (data.state && typeof data.state === 'string') {
            const normalized = data.state.replaceAll(' ', '_').toUpperCase();

            if (!Object.prototype.hasOwnProperty.call(GovernoratesNames, normalized)) {
                throw new NotFoundError(undefined, undefined, [
                    GovernorateErrors.INVALID_GOVERNORATE_NAME,
                ]);
            }

            const governorate = await governorateRepository.findOne(
                {
                    where: { name: normalized },
                },
                tx
            );

            if (!governorate?.id) {
                throw new NotFoundError(undefined, undefined, [
                    GovernorateErrors.GOVERNORATE_NOT_FOUND,
                ]);
            }
            governorateId = governorate.id;
        }

        const existingVenue = await venueRepository.findById(id);
        if (!existingVenue) {
            throw new NotFoundError(undefined, undefined, [VenueErrors.VENUE_NOT_FOUND]);
        }

        return venueRepository.update(
            {
                where: { id },
                data: {
                    ...data,
                    ...(data.latitude && { latitude: parseFloat(data.latitude) }),
                    ...(data.longitude && { longitude: parseFloat(data.longitude) }),
                    ...(governorateId && { governorateId }),
                },
            },
            tx
        );
    },

    /**
     * @param {number} id
     * @param {VenueProjection} [options]
     * @returns {Promise<Venue>}
     */
    async findById(id, options = {}) {
        const venue = await venueRepository.findById(id, options);

        if (!venue) {
            throw new NotFoundError(undefined, undefined, [VenueErrors.VENUE_NOT_FOUND]);
        }

        return venue;
    },

    /**
     * @deprecated Use getAll(options) instead
     */
    getVenues() {
        return prismaClient.venue.findMany();
    },
};

export default venueService;
