import { prisma as prismaClient } from '../config/db.js';

const venueService = {
    DEFAULT_EXCLUDE_FIELDS: {
        createdAt: true,
        updatedAt: true,
    },
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
        return tx.venue.create({
            data: {
                name,
                address,
                city,
                country,
                zipCode,
                longitude,
                latitude,
                googlePlaceId,
                state,
            },
        });
    },

    async update(
        venueId,
        { name, address, city, country, zipCode, longitude, latitude, googlePlaceId, state },
        tx = prismaClient
    ) {
        return tx.venue.update({
            where: { id: venueId },
            data: {
                name,
                address,
                city,
                country,
                zipCode,
                latitude,
                longitude,
                googlePlaceId,
                state,
            },
        });
    },

    async getVenues() {
        return prismaClient.venue.findMany();
    },
};
export default venueService;
