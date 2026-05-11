//@ts-check

import BaseRepository from './BaseRepository.js';
import { Country } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Country} CountryType
 */

/**
 * @extends {BaseRepository<CountryType, any, any, any, any, any, any>}
 */
export default class CountryRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Country);
    }
}
