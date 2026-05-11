//@ts-check

import BaseRepository from './BaseRepository.js';
import { Otp } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Otp} OtpType
 * @typedef {import('./../types/models').OtpCreate} OtpCreate
 * @typedef {import('./../types/models').OtpUpdate} OtpUpdate
 * @typedef {import('./../types/models').OtpWhereUnique} OtpWhereUnique
 * @typedef {import('./../types/models').OtpSelect} OtpSelect
 * @typedef {import('./../types/models').OtpInclude} OtpInclude
 * @typedef {import('./../types/models').OtpProjection} OtpProjection
 */

/**
 * @extends {BaseRepository<OtpType, OtpCreate, OtpUpdate, OtpWhereUnique, OtpSelect, OtpInclude, any>}
 */
export default class OtpRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Otp);
    }

    /**
     * @param {number} id
     * @param {OtpProjection} [projection]
     * @param {any} [tx]
     * @returns {Promise<OtpType | null>}
     */
    findById(id, projection = {}, tx = null) {
        return this.findUnique({
            where: { id },
            ...projection,
        }, tx);
    }
}
