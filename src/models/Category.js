//@ts-check

import BaseModel from './BaseModel.js';
import fileService from './../services/fileService.js';

import { dateCast, numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').CategoryData} CategoryDataType */

/** @extends {BaseModel<CategoryDataType>} */
class Category extends BaseModel {
    /** @param {CategoryDataType} data */
    constructor(data) {
        super(data);
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'name', cast: stringCast },
            { field: 'imagePath', cast: stringCast },
            { field: 'imageDisk', cast: stringCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    get imageUrl() {
        const categoryData = /** @type {any} */ (this);
        if (!categoryData.imagePath) return null;

        let path = categoryData.imagePath;
        if (!path.startsWith('/') && !path.startsWith('http')) {
            path = `/uploads/${path}`;
        }

        return fileService.getAbsUrl(path, categoryData.imageDisk);
    }

    static get resourceName() {
        return 'category';
    }

    /**
     * @returns {null}
     */
    static get softDeleteField() {
        return null;
    }
}

/** @type {typeof Category & (new (data: CategoryDataType) => Category & CategoryDataType)} */
const CategoryExport = /** @type {any} */ (Category);
export default CategoryExport;
