//@ts-check

import BaseRepository from './BaseRepository.js';
import { Hobbyist } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Hobbyist} HobbyistType
 */

/**
 * @extends {BaseRepository<HobbyistType, any, any, any, any, any, any>}
 */
export default class HobbyistRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Hobbyist);
    }
}
