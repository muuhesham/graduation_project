//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').Business} Business
 * @typedef {import('./../types/models').BusinessResourceData} BusinessResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class BusinessResource extends BaseResource {
    /**
     * @param {Business | any} business
     * @returns {BusinessResourceData}
     */
    static toArray(business) {
        return {
            commercialRegistration: business.commercialRegistration ?? null,
            taxId: business.taxId ?? null,
        };
    }
}
