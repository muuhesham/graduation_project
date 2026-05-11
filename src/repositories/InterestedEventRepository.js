//@ts-check

import BaseRepository from './BaseRepository.js';
import { InterestedEvent } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('@prisma/client').InterestedEvent} InterestedEventType
 * @typedef {import('@prisma/client').Prisma.InterestedEventCreateInput} InterestedEventCreate
 * @typedef {import('@prisma/client').Prisma.InterestedEventUpdateInput} InterestedEventUpdate
 * @typedef {import('@prisma/client').Prisma.InterestedEventWhereUniqueInput} InterestedEventWhereUnique
 * @typedef {import('@prisma/client').Prisma.InterestedEventSelect} InterestedEventSelect
 * @typedef {import('@prisma/client').Prisma.InterestedEventInclude} InterestedEventInclude
 */

/**
 * @extends {BaseRepository<InterestedEventType, InterestedEventCreate, InterestedEventUpdate, InterestedEventWhereUnique, InterestedEventSelect, InterestedEventInclude, any>}
 */
export default class InterestedEventRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, InterestedEvent);
    }
}
