//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel.js').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models/index.js').Company} CompanyType */

/** @extends {BaseModel<CompanyType>} */
class Company extends BaseModel {
    /** @param {CompanyType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'company';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'organizerId', cast: stringCast },
            { field: 'registrationNumber', cast: stringCast },
            { field: 'taxId', cast: stringCast },
            { field: 'officialDocumentsDisk', cast: stringCast },
            { field: 'officialDocumentsPath', cast: stringCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }
}

/** @type {typeof Company & (new (data: CompanyType) => Company & CompanyType)} */
const CompanyExport = /** @type {any} */ (Company);
export default CompanyExport;
