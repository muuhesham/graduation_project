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
     * @returns {Data}
     */
    static toArray(result) {
        const count = typeof result === 'number' ? result : Number(result?.activeUsers ?? 0);
        return {
            activeUsers: count,
        };
    }
}
