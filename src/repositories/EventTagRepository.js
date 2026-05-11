//@ts-check

import BaseRepository from './BaseRepository.js';
import { EventTag } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('@prisma/client').EventTag} EventTagType
 * @typedef {import('@prisma/client').Prisma.EventTagCreateInput} EventTagCreate
 * @typedef {import('@prisma/client').Prisma.EventTagUpdateInput} EventTagUpdate
 * @typedef {import('@prisma/client').Prisma.EventTagWhereUniqueInput} EventTagWhereUnique
 * @typedef {import('@prisma/client').Prisma.EventTagSelect} EventTagSelect
 * @typedef {import('@prisma/client').Prisma.EventTagInclude} EventTagInclude
 */

/**
 * @extends {BaseRepository<EventTagType, EventTagCreate, EventTagUpdate, EventTagWhereUnique, EventTagSelect, EventTagInclude, any>}
 */
export default class EventTagRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, EventTag);
    }
}
