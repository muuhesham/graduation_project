//@ts-check

import BaseModel from './BaseModel.js';
import { numberCast } from './casts.js';
import { Event, Tag } from './index.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('@prisma/client').EventTag} EventTagType */

/** @extends {BaseModel<EventTagType>} */
class EventTag extends BaseModel {
    /** @param {EventTagType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'eventTag';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'eventId', cast: numberCast },
            { field: 'tagId', cast: numberCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            event: Event,
            tag: Tag,
        };
    }
}

/** @type {typeof EventTag & (new (data: EventTagType) => EventTag & EventTagType)} */
const EventTagExport = /** @type {any} */ (EventTag);
export default EventTagExport;
