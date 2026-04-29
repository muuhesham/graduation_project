//@ts-check

import BaseRepository from './BaseRepository.js';

import { Event } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver.js').default} IDriver
 * @typedef {import('./../types/models/event.model.js').Event} EventType
 * @typedef {import('./../types/models/event.model.js').EventCreate} EventCreate
 * @typedef {import('./../types/models/event.model.js').EventUpdate} EventUpdate
 * @typedef {import('./../types/models/event.model.js').EventWhereUnique} EventWhereUnique
 * @typedef {import('./../types/models/event.model.js').EventSelect} EventSelect
 * @typedef {import('./../types/models/event.model.js').EventInclude} EventInclude
 * @typedef {import('./../types/models/event.model.js').EventProjection} EventProjection
 */

/**
 * @extends {BaseRepository<EventType, EventCreate, EventUpdate, EventWhereUnique, EventSelect, EventInclude, any>}
 */
export default class EventRepository extends BaseRepository {
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

    countAllEvents() {
        return super.count();
    }

    /**
     * @param {number} id
     * @param {EventProjection} [projection]
     */
    findByIdIncludingDeleted(id, projection = {}) {
        return super.withTrashed().findUnique({
            where: { id },
            ...projection,
        });
    }

    /**
     * @param {number} id
     */
    async restoreDeleted(id) {
        return super.update({
            where: { id, deletedAt: { not: null } },
            data: { deletedAt: null },
        });
    }

    /**
     * @param {number} id
     */
    async softDeleteById(id) {
        return super.update({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date() },
        });
    }
}
