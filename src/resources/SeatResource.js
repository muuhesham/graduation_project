//@ts-check

import BaseResource from './BaseResource.js';

/** @typedef {import('../models/Seat').default} SeatModel */

/**
 * @extends {BaseResource}
 */
export default class SeatResource extends BaseResource {
    /**
     * @param {SeatModel | any} seat
     * @returns {any}
     */
    static toArray(seat) {
        return {
            id: seat.id,
            eventId: seat.eventId,
            tierNumber: seat.tierNumber,
            rowIndex: seat.rowIndex,
            seatIndex: seat.seatIndex,
            isSold: seat.isSold,
            row: seat.rowIndex,
            number: seat.seatIndex,
        };
    }
}
