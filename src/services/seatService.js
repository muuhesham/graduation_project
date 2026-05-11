//@ts-check

import { prisma } from './../config/db.js';
import { seatRepository, eventSeatTierRepository } from './../repositories/index.js';

/**
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 * @typedef {import('./../types/models').EventSeatTier} EventSeatTier
 * @typedef {import('./../types/models').Seat} Seat
 */

class SeatService {
    /**
     * @deprecated Use createTiers instead
     * @param {any[]} priceTiers
     * @param {any} numberOfRows
     * @param {any} numberOfColumns
     * @param {number} eventId
     * @param {any} tx
     */
    createEventSeatTiers = async (
        priceTiers,
        numberOfRows,
        numberOfColumns,
        eventId,
        tx = prisma
    ) => {
        // @ts-ignore
        await tx.eventSeatTier.createMany({
            data: priceTiers.map((priceTier, index) => ({
                tierNumber: priceTier.id ? parseInt(priceTier.id) : index,
                name: priceTier.name,
                price: parseFloat(priceTier.price),
                color: priceTier.color,
                numberOfRows: parseInt(numberOfRows),
                numberOfColumns: parseInt(numberOfColumns),
                eventId,
            })),
        });
    };

    /**
     * Create seat tiers for an event.
     * @param {number} eventId
     * @param {object} options
     * @param {any[]} options.priceTiers
     * @param {number} options.numberOfRows
     * @param {number} options.numberOfColumns
     * @param {TransactionClient | null} [tx]
     */
    createTiers(eventId, { priceTiers, numberOfRows, numberOfColumns }, tx = null) {
        return eventSeatTierRepository.createEventSeatTiers(
            eventId,
            { priceTiers, numberOfRows, numberOfColumns },
            tx
        );
    }

    /**
     * @deprecated Use createSeats instead
     * @param {any[]} seatsData
     * @param {number} eventId
     * @param {any} tx
     */
    createEventSeats = async (seatsData, eventId, tx = prisma) => {
        // @ts-ignore
        await tx.eventSeat.createMany({
            data: seatsData.map((seat) => ({
                rowIndex: parseInt(seat.row),
                seatIndex: parseInt(seat.number),
                eventId,
                tierNumber:
                    seat.tierId != null && seat.tierId !== '' ? parseInt(seat.tierId) : null,
            })),
        });
    };

    /**
     * Create seats for an event.
     * @param {number} eventId
     * @param {any[]} seatsData
     * @param {TransactionClient | null} [tx]
     */
    createSeats(eventId, seatsData, tx = null) {
        return seatRepository.createSeats(eventId, seatsData, tx);
    }

    /**
     * Get tiers by event ID.
     * @param {number} eventId
     * @param {import('./../types/shared').RepositoryReadOptions<any, any, any, any>} [projection]
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<EventSeatTier[]>}
     */
    async getTiersByEvent(eventId, projection = {}, tx = null) {
        return eventSeatTierRepository.findMany(
            {
                ...projection,
                where: { ...projection.where, eventId },
                sort: projection.sort || { field: 'tierNumber', order: 'asc' },
            },
            tx
        );
    }

    /**
     * Get seats by event ID.
     * @param {number} eventId
     * @param {import('./../types/shared').RepositoryReadOptions<any, any, any, any>} [projection]
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<Seat[]>}
     */
    async getSeatsByEvent(eventId, projection = {}, tx = null) {
        return seatRepository.findMany(
            {
                ...projection,
                where: { ...projection.where, eventId },
                sort: projection.sort || { field: 'rowIndex', order: 'asc' },
            },
            tx
        );
    }
}

const seatService = new SeatService();
export default seatService;
