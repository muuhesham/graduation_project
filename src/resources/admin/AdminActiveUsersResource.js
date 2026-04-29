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
        // Handle both raw numbers and objects with activeUsers/activeInPeriod field
        let count = 0;
        
        if (typeof result === 'number') {
            count = result;
        } else if (result && typeof result === 'object') {
            count = result.activeUsers ?? result.activeInPeriod ?? 0;
        }

        return {
            activeUsers: Number(count) || 0,
        };
    }
}
