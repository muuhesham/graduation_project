//@ts-check

import BaseModel from './BaseModel.js';

import { Organizer, State } from './index.js';
import { dateCast, numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/**
 * @typedef {import('@prisma/client').City} CityType
 */

/**
 * @extends {BaseModel<CityType>}
 **/
class City extends BaseModel {
    /** @param {CityType} data */
    constructor(data) {
        super(data);
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'stateId', cast: numberCast },
            { field: 'name', cast: stringCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    static get resourceName() {
        return 'city';
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            state: State,
            organizers: [Organizer],
        };
    }
}

/** @type {typeof City & (new (data: CityType) => City)} */
const CityExport = /** @type {any} */ (City);
export default CityExport;
