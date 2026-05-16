//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').Company} Company
 * @typedef {import('./../types/models').CompanyResourceData} CompanyResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class CompanyResource extends BaseResource {
    /**
     * @param {Company | any} company
     * @returns {CompanyResourceData}
     */
    static toArray(company) {
        return {
            registrationNumber: company.registrationNumber ?? null,
            taxId: company.taxId ?? null,
            officialDocumentsUrl: company.officialDocumentsUrl ?? null,
        };
    }
}
