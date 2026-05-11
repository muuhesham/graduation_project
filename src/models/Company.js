//@ts-check

import BaseModel from './BaseModel.js';
import { Organizer } from './index.js';
import { dateCast, stringCast } from './casts.js';
import fileService from './../services/fileService.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('@prisma/client').Company} CompanyData */
/** @typedef {CompanyData & { officialDocumentsDisk?: string | null; officialDocumentsPath?: string | null }} CompanyType */

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
     * @param {string} userId
     * @returns {string}
     */
    static getUploadPath(userId) {
        return `user/${userId}/organizer/documents`;
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
            { field: 'registrationNumber', cast: stringCast },
            { field: 'taxId', cast: stringCast },
            { field: 'officialDocumentsDisk', cast: stringCast },
            { field: 'officialDocumentsPath', cast: stringCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    get officialDocumentsUrl() {
        const company = /** @type {CompanyType} */ (/** @type {unknown} */ (this));

        return company.officialDocumentsPath && company.officialDocumentsDisk
            ? fileService.getAbsUrl(company.officialDocumentsPath, company.officialDocumentsDisk)
            : null;
    }
}

/** @type {typeof Company & (new (data: CompanyType) => Company & CompanyType)} */
const CompanyExport = /** @type {any} */ (Company);
export default CompanyExport;
