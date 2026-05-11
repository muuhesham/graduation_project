//@ts-check

import BaseModel from './BaseModel.js';
import { booleanCast, numberCast } from './casts.js';
import Event from './Event.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').SeatData} SeatData */

/**
 * @extends {BaseModel<SeatData>}
 **/
class Seat extends BaseModel {
    /** @param {SeatData} data */
    constructor(data) {
        super(data);
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'eventId', cast: numberCast },
            { field: 'tierNumber', cast: numberCast },
            { field: 'rowIndex', cast: numberCast },
            { field: 'seatIndex', cast: numberCast },
            { field: 'isSold', cast: booleanCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            event: Event,
        };
    }

    static get resourceName() {
        return 'eventSeat';
    }
}

/** @type {typeof Seat & (new (data: SeatData) => Seat & SeatData)} */
const SeatExport = /** @type {any} */ (Seat);
export default SeatExport;
