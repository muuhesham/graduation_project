//@ts-check

import BaseRepository from './BaseRepository.js';
import { Business } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Business} BusinessType
 */

/**
 * @extends {BaseRepository<BusinessType, any, any, any, any, any, any>}
 */
export default class BusinessRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Business);
    }
}
