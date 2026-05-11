//@ts-check

import BaseModel from './BaseModel.js';
import { jsonCast, numberCast, stringCast } from './casts.js';
import { User, Venue } from './index.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').GovernorateData} GovernorateDataType */

/** @extends {BaseModel<GovernorateDataType>} */
class Governorate extends BaseModel {
    /** @param {GovernorateDataType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'governorate';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'name', cast: stringCast },
            { field: 'latitude', cast: numberCast },
            { field: 'longitude', cast: numberCast },
            { field: 'otherGovsIdsSorted', cast: jsonCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            users: [User],
            venues: [Venue],
        };
    }
}

/** @type {typeof Governorate & (new (data: GovernorateDataType) => Governorate & GovernorateDataType)} */
const GovernorateExport = /** @type {any} */ (Governorate);
export default GovernorateExport;
