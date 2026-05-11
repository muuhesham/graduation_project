//@ts-check

import BaseRepository from './BaseRepository.js';
import { Company } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Company} CompanyType
 */

/**
 * @extends {BaseRepository<CompanyType, any, any, any, any, any, any>}
 */
export default class CompanyRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Company);
    }
}
