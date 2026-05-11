//@ts-check

import BaseRepository from './BaseRepository.js';

import { Seat } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 * @typedef {import('./../types/models').Seat} SeatType
 * @typedef {import('./../types/models').SeatCreate} SeatCreate
 * @typedef {import('./../types/models').SeatUpdate} SeatUpdate
 * @typedef {import('./../types/models').SeatWhereUnique} SeatWhereUnique
 * @typedef {import('./../types/models').SeatSelect} SeatSelect
 * @typedef {import('./../types/models').SeatInclude} SeatInclude
 */

/**
 * @extends {BaseRepository<SeatType, SeatCreate, SeatUpdate, SeatWhereUnique, SeatSelect, SeatInclude, any>}
 */
export default class SeatRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Seat);
    }

    /**
     * @param {number} eventId
     * @param {any[]} seatsData
     * @param {TransactionClient | null} [tx]
     */
    async createSeats(eventId, seatsData, tx = null) {
        if (!seatsData || !Array.isArray(seatsData)) {
            return { count: 0 };
        }

        /** @type {SeatCreate[]} */
        const data = seatsData.map((seat) => ({
            rowIndex: Number(seat.row),
            seatIndex: Number(seat.number),
            eventId,
            tierNumber:
                seat.tierId !== undefined && seat.tierId !== null && seat.tierId !== ''
                    ? Number(seat.tierId)
                    : null,
        }));

        return this.bulkInsert({ data }, tx);
    }
}
