//@ts-check

import BaseModel from './BaseModel.js';
import { Event, Governorate } from './index.js';
import { dateCast, numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').VenueData} VenueDataType */

/** @extends {BaseModel<VenueDataType>} */
class Venue extends BaseModel {
    /** @param {VenueDataType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'venue';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'googlePlaceId', cast: stringCast },
            { field: 'name', cast: stringCast },
            { field: 'address', cast: stringCast },
            { field: 'city', cast: stringCast },
            { field: 'state', cast: stringCast },
            { field: 'country', cast: stringCast },
            { field: 'zipCode', cast: stringCast },
            { field: 'latitude', cast: numberCast },
            { field: 'longitude', cast: numberCast },
            { field: 'governorateId', cast: numberCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            events: [Event],
            governorate: Governorate,
        };
    }

    /**
     * @returns {null}
     */
    static get softDeleteField() {
        return null;
    }
}

/** @type {typeof Venue & (new (data: VenueDataType) => Venue & VenueDataType)} */
const VenueExport = /** @type {any} */ (Venue);
export default VenueExport;
