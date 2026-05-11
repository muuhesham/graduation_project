//@ts-check

import BaseModel from './BaseModel.js';
import { Organizer } from './index.js';
import { dateCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').Hobbyist} HobbyistType */

/** @extends {BaseModel<HobbyistType>} */
class Hobbyist extends BaseModel {
    /** @param {HobbyistType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'hobbyist';
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            organizer: Organizer,
        };
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'organizerId', cast: stringCast },
            { field: 'nationalId', cast: stringCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }
}

/** @type {typeof Hobbyist & (new (data: HobbyistType) => Hobbyist & HobbyistType)} */
const HobbyistExport = /** @type {any} */ (Hobbyist);
export default HobbyistExport;
