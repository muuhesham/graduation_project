//@ts-check

import BaseModel from './BaseModel.js';
import { numberCast, stringCast } from './casts.js';
import { Event } from './index.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('@prisma/client').EventRule} EventRuleType */

/** @extends {BaseModel<EventRuleType>} */
class EventRule extends BaseModel {
    /** @param {EventRuleType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'eventRule';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'eventId', cast: numberCast },
            { field: 'rule', cast: stringCast },
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

/** @type {typeof EventRule & (new (data: EventRuleType) => EventRule & EventRuleType)} */
const EventRuleExport = /** @type {any} */ (EventRule);
export default EventRuleExport;
