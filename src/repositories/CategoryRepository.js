//@ts-check

import BaseRepository from './BaseRepository.js';

import { Category } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Category} CategoryType
 * @typedef {import('./../types/models').CategoryCreate} CategoryCreate
 * @typedef {import('./../types/models').CategoryUpdate} CategoryUpdate
 * @typedef {import('./../types/models').CategoryWhereUnique} CategoryWhereUnique
 * @typedef {import('./../types/models').CategorySelect} CategorySelect
 * @typedef {import('./../types/models').CategoryInclude} CategoryInclude
 * @typedef {import('./../types/models').CategoryProjection} CategoryProjection
 */

/**
 * @extends {BaseRepository<CategoryType, CategoryCreate, CategoryUpdate, CategoryWhereUnique, CategorySelect, CategoryInclude, any>}
 */
export default class CategoryRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Category);
    }

    /**
     * @param {CategoryCreate} data
     */
    create(data) {
        return super.create(data);
    }

    /**
     * @param {number} id
     * @return {Promise<CategoryType|null>}
     */
    findById(id) {
        return super.findUnique({ where: { id } });
    }

    /**
     * @param {string} name
     * @return {Promise<CategoryType|null>}
     */
    findByName(name) {
        return super.findUnique({ where: { name } });
    }
}
