//@ts-check

import BaseRepository from './BaseRepository.js';

import { Event } from './../models/index.js';
import SessionStatus from '../constants/enums/sessionStatus.js';

/**
 * @typedef {import('./drivers/IDriver.js').default} IDriver
 * @typedef {import('./../types/models/event.model.js').Event} EventType
 * @typedef {import('./../types/models/event.model.js').EventCreate} EventCreate
 * @typedef {import('./../types/models/event.model.js').EventUpdate} EventUpdate
 * @typedef {import('./../types/models/event.model.js').EventWhereUnique} EventWhereUnique
 * @typedef {import('./../types/models/event.model.js').EventSelect} EventSelect
 * @typedef {import('./../types/models/event.model.js').EventInclude} EventInclude
 * @typedef {import('./../types/models/event.model.js').EventProjection} EventProjection
 * @typedef {import('./../types/shared/common.types.js').PaginationQuery} PaginationQuery
 */

/**
 * @extends {BaseRepository<EventType, EventCreate, EventUpdate, EventWhereUnique, EventSelect, EventInclude, any>}
 */
export default class EventRepository extends BaseRepository {
    /** @type {EventInclude} */
    #SEARCH_RELATIONS = {
        venue: true,
        ticketTypes: true,
        category: true,
        eventSessions: {
            where: {
                status: /** @type {any} */ (SessionStatus.ACTIVE),
            },
        },
        eventTags: { include: { tag: true } },
    };

    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Event, {
            searchFields: ['title', 'description', 'slug'],
        });
    }

    /**
     * @param {number} id
     * @param {EventProjection} [projection]
     * @returns {Promise<EventType | null>}
     */
    findById(id, projection = {}) {
        return super.findUnique({
            where: { id },
            ...projection,
        });
    }

    /**
     * @param {string} tableName
     * @param {string[]} whereClauses
     * @param {any[]} parameters
     * @returns {Promise<number>}
     */
    async countVectorMatches(tableName, whereClauses, parameters) {
        const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const sql = `SELECT COUNT(*)::int AS count FROM ${tableName} ${where}`;
        
        const result = await this.rawQuery(sql, parameters);
        return Number(result[0]?.count) || 0;
    }

    countAllEvents() {
        return super.count();
    }

    /**
     * @param {number} id
     * @param {EventProjection} [projection]
     * @returns {Promise<EventType | null>}
     */
    findByIdIncludingDeleted(id, projection = {}) {
        return this.withTrashed().findUnique({
            where: { id },
            ...projection,
        });
    }

    /**
     * @param {{ id: number; similarity: number }[]} matches
     * @returns {Promise<EventType[]>}
     */
    async hydrateSearchMatches(matches) {
        const ids = matches.map((m) => m.id).filter((id) => !isNaN(id));
        if (!ids.length) return [];

        const events = await this.findMany({
            where: { id: { in: ids }, deletedAt: null },
            include: this.#SEARCH_RELATIONS,
        });

        const eventsById = new Map(events.map((e) => [Number(e.id), e]));

        return matches
            .map((m) => {
                const event = eventsById.get(m.id);
                if (!event) return null;

                const hydrated = /** @type {any} */ (event);
                hydrated.similarity = m.similarity;
                return hydrated;
            })
            .filter(Boolean);
    }

    /**
     * @param {object} params
     * @param {import('@prisma/client').Prisma.EventWhereInput} params.where
     * @param {PaginationQuery} params.pagination
     * @returns {Promise<import('../types/shared/common.types.js').PaginatedResult<EventType>>}
     */
    searchByKeywords({ where, pagination }) {
        return this.paginate({
            where: { ...where, deletedAt: null },
            pagination,
            include: this.#SEARCH_RELATIONS,
            sort: { field: 'createdAt', order: 'desc' },
        });
    }

    /**
     * @param {number} id
     */
    softDeleteById(id) {
        return super.update({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date() },
        });
    }

    /**
     * @param {number} id
     */
    restoreDeleted(id) {
        return super.update({
            where: { id, deletedAt: { not: null } },
            data: { deletedAt: null },
        });
    }
}
