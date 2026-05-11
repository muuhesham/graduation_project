//@ts-check

import BaseModel from './BaseModel.js';
import { numberCast, stringCast, decimalCast } from './casts.js';
import Event from './Event.js';
import Seat from './Seat.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').EventSeatTierData} EventSeatTierData */

/**
 * @extends {BaseModel<EventSeatTierData>}
 **/
class EventSeatTier extends BaseModel {
    /** @param {EventSeatTierData} data */
    constructor(data) {
        super(data);
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'tierNumber', cast: numberCast },
            { field: 'eventId', cast: numberCast },
            { field: 'name', cast: stringCast },
            { field: 'price', cast: decimalCast },
            { field: 'color', cast: stringCast },
            { field: 'numberOfRows', cast: numberCast },
            { field: 'numberOfColumns', cast: numberCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            event: Event,
            seats: [Seat],
        };
    }

    static get resourceName() {
        return 'eventSeatTier';
    }
}

/** @type {typeof EventSeatTier & (new (data: EventSeatTierData) => EventSeatTier & EventSeatTierData)} */
const EventSeatTierExport = /** @type {any} */ (EventSeatTier);
export default EventSeatTierExport;
