//@ts-check

import BaseModel from './BaseModel.js';
import { Organizer } from './index.js';
import { dateCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').Business} BusinessType */

/** @extends {BaseModel<BusinessType>} */
class Business extends BaseModel {
    /** @param {BusinessType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'business';
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
            { field: 'commercialRegistration', cast: stringCast },
            { field: 'taxId', cast: stringCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }
}

/** @type {typeof Business & (new (data: BusinessType) => Business & BusinessType)} */
const BusinessExport = /** @type {any} */ (Business);
export default BusinessExport;
