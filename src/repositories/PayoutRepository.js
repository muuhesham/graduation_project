//@ts-check

import BaseRepository from './BaseRepository.js';
import { Payout } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Payout} PayoutType
 * @typedef {import('./../types/models').PayoutCreate} PayoutCreate
 * @typedef {import('./../types/models').PayoutUpdate} PayoutUpdate
 * @typedef {import('./../types/models').PayoutWhereUnique} PayoutWhereUnique
 * @typedef {import('./../types/models').PayoutSelect} PayoutSelect
 * @typedef {import('./../types/models').PayoutInclude} PayoutInclude
 * @typedef {import('./../types/models').PayoutProjection} PayoutProjection
 */

/**
 * @extends {BaseRepository<PayoutType, PayoutCreate, PayoutUpdate, PayoutWhereUnique, PayoutSelect, PayoutInclude, any>}
 */
export default class PayoutRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Payout);
    }

    /**
     * @param {string | number} id
     * @param {object} [options]
     * @param {TransactionClient} [tx]
     * @returns {Promise<PayoutType | null>}
     */
    async findById(id, options = {}, tx = null) {
        return this.findOne({ ...options, where: { id } }, tx);
    }
}
