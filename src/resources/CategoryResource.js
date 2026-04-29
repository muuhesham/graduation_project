//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').Category} Category
 * @typedef {import('./../types/models').CategoryResourceData} CategoryResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class CategoryResource extends BaseResource {
    /**
     * @param {Category | any} category
     * @returns {CategoryResourceData | null}
     */
    static make(category) {
        return super.make(category);
    }

    /**
     * @param {Category | any} category
     * @returns {CategoryResourceData}
     */
    static toArray(category) {
        return {
            id: category.id ?? null,
            name: category.name ?? null,
            imageUrl: category.imageUrl ?? null,
        };
    }
}
