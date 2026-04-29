//@ts-check

import BaseRepository from './BaseRepository.js';
import { Payout } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver.js').default} IDriver
 * @typedef {import('./../types/models/payout.model.js').Payout} PayoutType
 * @typedef {import('./../types/models/payout.model.js').PayoutCreate} PayoutCreate
 * @typedef {import('./../types/models/payout.model.js').PayoutUpdate} PayoutUpdate
 * @typedef {import('./../types/models/payout.model.js').PayoutWhereUnique} PayoutWhereUnique
 * @typedef {import('./../types/models/payout.model.js').PayoutSelect} PayoutSelect
 * @typedef {import('./../types/models/payout.model.js').PayoutInclude} PayoutInclude
 * @typedef {import('./../types/models/payout.model.js').PayoutProjection} PayoutProjection
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
}
