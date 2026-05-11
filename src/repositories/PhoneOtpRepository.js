//@ts-check

import BaseRepository from './BaseRepository.js';
import { PhoneOtp } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').PhoneOtp} PhoneOtpType
 * @typedef {import('./../types/models').PhoneOtpCreate} PhoneOtpCreate
 * @typedef {import('./../types/models').PhoneOtpUpdate} PhoneOtpUpdate
 * @typedef {import('./../types/models').PhoneOtpWhereUnique} PhoneOtpWhereUnique
 * @typedef {import('./../types/models').PhoneOtpSelect} PhoneOtpSelect
 * @typedef {import('./../types/models').PhoneOtpInclude} PhoneOtpInclude
 * @typedef {import('./../types/models').PhoneOtpProjection} PhoneOtpProjection
 */

/**
 * @extends {BaseRepository<PhoneOtpType, PhoneOtpCreate, PhoneOtpUpdate, PhoneOtpWhereUnique, PhoneOtpSelect, PhoneOtpInclude, any>}
 */
export default class PhoneOtpRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, PhoneOtp);
    }

    /**
     * @param {number} id
     * @param {PhoneOtpProjection} [projection]
     * @param {any} [tx]
     * @returns {Promise<PhoneOtpType | null>}
     */
    findById(id, projection = {}, tx = null) {
        return this.findUnique({
            where: { id },
            ...projection,
        }, tx);
    }
}
