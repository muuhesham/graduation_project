//@ts-check

import BaseResource from './../BaseResource.js';

/**
 * @typedef {import('./../../types/models').AdminActiveUsersResourceData} Data
 */

/**
 * @extends {BaseResource}
 */
export default class AdminActiveUsersResource extends BaseResource {
    /**
     * @param {any} result
     * @returns {Data | null}
     */
    static make(result) {
        return super.make(result);
    }

    /**
     * @param {any} result
     * @returns {Data}
     */
    static toArray(result) {
        return {
            activeUsers: Number(result?.activeUsers ?? 0),
        };
    }
}
