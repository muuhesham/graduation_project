//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel.js').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models/index.js').Business} BusinessType */

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
