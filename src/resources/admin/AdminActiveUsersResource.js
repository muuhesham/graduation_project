//@ts-check

import BaseResource from './../BaseResource.js';

/**
 * @typedef {import('./../../types/models').AdminActiveUsersResourceData} Data
 */

/**
 * @extends {BaseResource<any, Data>}
 */
export default class AdminActiveUsersResource extends BaseResource {
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
