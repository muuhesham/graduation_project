//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast, stringCast } from './casts.js';
import User from './User.js';
import Event from './Event.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('@prisma/client').InterestedEvent} InterestedEventType */

/** @extends {BaseModel<InterestedEventType>} */
class InterestedEvent extends BaseModel {
    /** @param {InterestedEventType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'interestedEvent';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'userId', cast: stringCast },
            { field: 'eventId', cast: numberCast },
            { field: 'createdAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            user: User,
            event: Event,
        };
    }
}

/** @type {typeof InterestedEvent & (new (data: InterestedEventType) => InterestedEvent & InterestedEventType)} */
const InterestedEventExport = /** @type {any} */ (InterestedEvent);
export default InterestedEventExport;
