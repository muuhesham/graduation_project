//@ts-check

import BaseObserver from './BaseObserver.js';
import fileService from '../services/fileService.js';

/**
 * @typedef {import('./../types/models').Category} Category
 */

/**
 * @extends {BaseObserver<Category>}
 */
export default class CategoryObserver extends BaseObserver {
    /**
     * @param {Category} category
     * @param {any} [tx]
     */
    async updating(category, tx) {
        // Logic to check if image changed would go here if we had the new data.
        // For now, side effects are usually handled in 'updated' if we need to compare,
        // or 'deleting' for absolute removal.
    }

    /**
     * @param {Category} category
     * @param {any} [tx]
     */
    async deleting(category, tx) {
        if (category.imagePath) {
            await fileService.delete(category.imagePath, category.imageDisk).catch((err) => {
                console.error(`Failed to delete category image ${category.imagePath} during deletion:`, err);
            });
        }
    }
}
