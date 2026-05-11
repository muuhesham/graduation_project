//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').Category} Category
 * @typedef {import('./../types/models').CategoryResourceData} CategoryResourceData
 */

/**
 * @extends {BaseResource}
 */
class CategoryResource extends BaseResource {
    /**
     * @param {import('./../types/models').Category} category
     */
    static toArray(category) {
        if (!category) return null;

        return {
            id: category.id,
            name: category.name,
            imageUrl: category.imageUrl,
            createdAt: category.createdAt,
        };
    }
}

export default CategoryResource;
