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
     * @param {string} organizerId
     * @param {object} data
     * @param {import('@prisma/client').Prisma.TransactionClient} tx
     */
    create(organizerId, data, tx) {
        return tx.business.create({
            data: {
                organizerId,
                commercialRegistration: data.commercialRegistration,
                taxId: data.taxId,
            },
        });
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
