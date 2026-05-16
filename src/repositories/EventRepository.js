//@ts-check

import BaseRepository from './BaseRepository.js';

import { Event } from './../models/index.js';
import SessionStatus from '../constants/enums/sessionStatus.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Event} EventType
 * @typedef {import('./../types/models').EventCreate} EventCreate
 * @typedef {import('./../types/models').EventUpdate} EventUpdate
 * @typedef {import('./../types/models').EventWhereUnique} EventWhereUnique
 * @typedef {import('./../types/models').EventSelect} EventSelect
 * @typedef {import('./../types/models').EventInclude} EventInclude
 * @typedef {import('./../types/models').EventProjection} EventProjection
 * @typedef {import('./../types/shared').PaginationQuery} PaginationQuery
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
            mutationInclude: {
                category: true,
                venue: true,
                eventRules: { select: { rule: true } },
                eventTags: { include: { tag: { select: { name: true } } } },
            },
        });
    }

    /**
     * @param {number} id
     * @param {EventProjection} [projection]
     * @param {any} [tx]
     * @returns {Promise<EventType | null>}
     */
    findById(id, projection = {}, tx = null) {
        return super.findUnique(
            {
                where: { id },
                ...projection,
            },
            tx
        );
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
     * @param {any} [tx]
     * @returns {Promise<EventType | null>}
     */
    findByIdIncludingDeleted(id, projection = {}, tx = null) {
        return this.withTrashed().findUnique(
            {
                where: { id },
                ...projection,
            },
            tx
        );
    }

    /**
     * @param {string} organizerId
     * @param {string} slug
     * @param {EventProjection} [projection]
     * @param {any} [tx]
     * @returns {Promise<EventType | null>}
     */
    findBySlug(organizerId, slug, projection = {}, tx = null) {
        return super.findUnique(
            {
                ...projection,
                where: { organizerId, slug, deletedAt: null },
            },
            tx
        );
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
     * @returns {Promise<import('../types/shared').PaginatedResult<EventType>>}
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
     * @param {any} [tx]
     */
    softDeleteById(id, tx = null) {
        return super.update(
            {
                where: { id, deletedAt: null },
                data: { deletedAt: new Date() },
            },
            tx
        );
    }

    /**
     * @param {number} id
     * @param {any} [tx]
     */
    restoreDeleted(id, tx = null) {
        return this.withTrashed().update(
            {
                where: { id, deletedAt: { not: null } },
                data: { deletedAt: null },
            },
            tx
        );
    }
}
