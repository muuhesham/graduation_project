//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').EventRevenueResourceData} RevenueData
 */

/**
 * @extends {BaseResource}
 */
export default class RevenueResource extends BaseResource {
    /**
     * @param {any} revenue
     * @returns {RevenueData | null}
     */
    static make(revenue) {
        return super.make(revenue);
    }

    /**
     * @param {any} revenue
     * @returns {RevenueData}
     */
    static toArray(revenue) {
        if (typeof revenue === 'number') {
            return { total: revenue };
        }

        return {
            total: Number(revenue?.total ?? 0),
        };
    }
}
