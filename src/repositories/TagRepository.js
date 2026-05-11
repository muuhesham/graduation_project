//@ts-check

import BaseRepository from './BaseRepository.js';
import { Tag } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Tag} TagType
 * @typedef {import('./../types/models').TagCreate} TagCreate
 * @typedef {import('./../types/models').TagUpdate} TagUpdate
 * @typedef {import('./../types/models').TagWhereUnique} TagWhereUnique
 * @typedef {import('./../types/models').TagSelect} TagSelect
 * @typedef {import('./../types/models').TagInclude} TagInclude
 */

/**
 * @extends {BaseRepository<TagType, TagCreate, TagUpdate, TagWhereUnique, TagSelect, TagInclude, any>}
 */
export default class TagRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Tag, {
            searchFields: ['name'],
        });
    }

    /**
     * @param {string} name
     * @returns {Promise<TagType | null>}
     */
    findByName(name) {
        return this.findOne({
            where: { name },
        });
    }

    /**
     * @param {string[]} names
     * @returns {Promise<TagType[]>}
     */
    async findByNames(names) {
        return this.findMany({
            where: {
                name: { in: names },
            },
        });
    }
}
