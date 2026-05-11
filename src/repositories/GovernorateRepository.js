//@ts-check

import BaseRepository from './BaseRepository.js';
import { Governorate } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Governorate} GovernorateType
 * @typedef {import('./../types/models').GovernorateCreate} GovernorateCreate
 * @typedef {import('./../types/models').GovernorateUpdate} GovernorateUpdate
 * @typedef {import('./../types/models').GovernorateWhereUnique} GovernorateWhereUnique
 * @typedef {import('./../types/models').GovernorateSelect} GovernorateSelect
 * @typedef {import('./../types/models').GovernorateInclude} GovernorateInclude
 * @typedef {import('./../types/models').GovernorateProjection} GovernorateProjection
 */

/**
 * @extends {BaseRepository<GovernorateType, GovernorateCreate, GovernorateUpdate, GovernorateWhereUnique, GovernorateSelect, GovernorateInclude, any>}
 */
export default class GovernorateRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Governorate);
    }

    /**
     * @param {number} id
     * @param {GovernorateProjection} [projection]
     * @returns {Promise<GovernorateType | null>}
     */
    findById(id, projection = {}) {
        return this.findUnique({
            ...projection,
            where: { id },
        });
    }
}
