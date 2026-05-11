//@ts-check

import BaseRepository from './BaseRepository.js';
import { EventRule } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('@prisma/client').EventRule} EventRuleType
 * @typedef {import('@prisma/client').Prisma.EventRuleCreateInput} EventRuleCreate
 * @typedef {import('@prisma/client').Prisma.EventRuleUpdateInput} EventRuleUpdate
 * @typedef {import('@prisma/client').Prisma.EventRuleWhereUniqueInput} EventRuleWhereUnique
 * @typedef {import('@prisma/client').Prisma.EventRuleSelect} EventRuleSelect
 * @typedef {import('@prisma/client').Prisma.EventRuleInclude} EventRuleInclude
 */

/**
 * @extends {BaseRepository<EventRuleType, EventRuleCreate, EventRuleUpdate, EventRuleWhereUnique, EventRuleSelect, EventRuleInclude, any>}
 */
export default class EventRuleRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, EventRule);
    }
}
