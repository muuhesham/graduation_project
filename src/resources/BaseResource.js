//@ts-check

import { makePagination } from './helpers/pagination.js';

/**
 * @typedef {import('./../types/shared/common.types.js').PaginationMeta} PaginationMeta
 */

/**
 * @abstract
 */
export default class BaseResource {
    /**
     * @param {any} data
     * @returns {any}
     */
    static make(data) {
        if (data === null || data === undefined) return null;

        const resource = this.toArray(data);
        return this.cleanup(resource, data);
    }

    /**
     * Transform the data into a plain object.
     * @abstract
     * @param {any} data
     * @returns {any}
     */
    static toArray(data) {
        throw new Error('Method toArray() must be implemented');
    }

    /**
     * @param {any[]} items
     * @returns {any[]}
     */
    static collection(items) {
        if (!Array.isArray(items)) return [];
        return items.map((item) => this.make(item)).filter(Boolean);
    }

    /**
     * @param {any} result
     * @param {string} [dataKey]
     * @returns {any}
     */
    static paginate(result, dataKey = 'data') {
        return {
            [dataKey]: this.collection(result?.data || []),
            pagination: makePagination(result?.pagination ?? result?.meta),
        };
    }

    /**
     * Automatically removes *Id fields if the corresponding relation is present.
     * @param {any} resource
     * @param {any} originalData
     * @returns {any}
     */
    static cleanup(resource, originalData) {
        for (const [key, value] of Object.entries(resource)) {
            if (value !== null && typeof value === 'object') {
                const idKey = `${key}Id`;
                if (idKey in resource && originalData[key] !== undefined) {
                    delete resource[idKey];
                }
            }
        }
        return resource;
    }
}
