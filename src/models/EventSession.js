//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast, stringCast } from './casts.js';
import { Event } from './index.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('@prisma/client').EventSession} EventSessionType */

/** @extends {BaseModel<EventSessionType>} */
class EventSession extends BaseModel {
    /** @param {EventSessionType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'eventSession';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'eventId', cast: numberCast },
            { field: 'status', cast: stringCast },
            { field: 'startDate', cast: dateCast },
            { field: 'endDate', cast: dateCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
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
}

/** @type {typeof EventSession & (new (data: EventSessionType) => EventSession & EventSessionType)} */
const EventSessionExport = /** @type {any} */ (EventSession);
export default EventSessionExport;
