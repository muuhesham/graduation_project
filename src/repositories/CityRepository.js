//@ts-check

import BaseRepository from './BaseRepository.js';
import { City } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').City} CityType
 */

/**
 * @extends {BaseRepository<CityType, any, any, any, any, any, any>}
 */
export default class CityRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, City);
    }
}
