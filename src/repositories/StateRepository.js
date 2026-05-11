//@ts-check

import BaseRepository from './BaseRepository.js';
import { State } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').State} StateType
 * @typedef {import('@prisma/client').Prisma.StateCreateInput} StateCreate
 * @typedef {import('@prisma/client').Prisma.StateUpdateInput} StateUpdate
 * @typedef {import('@prisma/client').Prisma.StateWhereUniqueInput} StateWhereUnique
 * @typedef {import('@prisma/client').Prisma.StateSelect} StateSelect
 * @typedef {import('@prisma/client').Prisma.StateInclude} StateInclude
 */

/**
 * @extends {BaseRepository<StateType, StateCreate, StateUpdate, StateWhereUnique, StateSelect, StateInclude, any>}
 */
export default class StateRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, State, {
            searchFields: ['name'],
        });
    }

    /**
     * @param {number} countryId
     */
    async findByCountryId(countryId) {
        return this.findMany({
            where: { countryId },
            sort: { field: 'name', order: 'asc' },
        });
    }
}
