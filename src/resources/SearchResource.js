//@ts-check

import BaseResource from './BaseResource.js';
import SearchEventResource from './SearchEventResource.js';

/**
 * @extends {BaseResource}
 */
export default class SearchResource extends BaseResource {
    /**
     * @param {any} result
     * @param {string} [dataKey]
     * @returns {any}
     */
    static paginate(result, dataKey = 'data') {
        return {
            [dataKey]: SearchEventResource.collection(result?.data || []),
            pagination: result.pagination,
        };
    }
}
