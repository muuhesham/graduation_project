//@ts-check

import { randomUUID } from 'node:crypto';
import { Document } from '@langchain/core/documents';
import aiService from './aiService.js';
import { eventRepository } from '../repositories/index.js';
import InternalServerError from '../errors/InternalServerError.js';
import { DATABASE_URL } from '../config/env.js';
import SearchErrors from '../constants/messages/errors/search.js';
import EventErrors from '../constants/messages/errors/event.js';

/**
 * @typedef {import('../types/search.types').IndexableEvent} IndexableEvent
 * @typedef {typeof import('./aiService').default} AIService
 * @typedef {import('../repositories/EventRepository').default} EventRepository
 * @typedef {import('../types/search.types').SearchFilters} SearchFilters
 * @typedef {import('@langchain/community/vectorstores/pgvector').PGVectorStore} PGVectorStore
 * @typedef {import('../types/models').Event} EventModel
 */

const TABLE_NAME = 'event_search_documents';
const DEFAULT_SEARCH_LIMIT = 10;
const MAX_SEARCH_LIMIT = 100;

class EventEmbeddingService {
    /** @type {PGVectorStore | null} */
    #store = null;
    /** @type {Promise<PGVectorStore> | null} */
    #storeInitPromise = null;
    #storeUnavailable = false;

    /** @type {EventRepository} */
    #eventRepository;
    /** @type {AIService} */
    #aiService;

    /**
     * @param {EventRepository} eventRepository
     * @param {AIService} aiService
     */
    constructor(eventRepository, aiService) {
        this.#eventRepository = eventRepository;
        this.#aiService = aiService;
    }

    /**
     * @param {number[]} embedding
     * @param {object} [options]
     * @param {SearchFilters} [options.filters]
     * @param {number} [options.limit]
     * @param {number} [options.page]
     */
    async searchByEmbedding(embedding, options = {}) {
        const { filters = {}, limit = DEFAULT_SEARCH_LIMIT, page = 1 } = options;

        const normalizedLimit = Math.min(
            MAX_SEARCH_LIMIT,
            Math.max(1, Number(limit) || DEFAULT_SEARCH_LIMIT)
        );
        const offset = (Math.max(1, Number(page) || 1) - 1) * normalizedLimit;

        const vectorFilter = this.#buildVectorFilter(filters);
        const store = await this.#getStore();

        if (!store) {
            throw new InternalServerError(undefined, undefined, [
                {
                    message: SearchErrors.SEARCH_FAILED.message,
                    code: SearchErrors.SEARCH_FAILED.code,
                },
            ]);
        }

        try {
            const [matches, total] = await Promise.all([
                store.similaritySearchVectorWithScore(
                    embedding,
                    offset + normalizedLimit,
                    vectorFilter
                ),
                this.#countMatches(store, vectorFilter),
            ]);

            return {
                total,
                events: matches
                    .slice(offset)
                    .map(
                        /** @param {[Document, number]} result */
                        ([doc, score]) => ({
                            id: Number(doc.metadata?.eventId),
                            similarity: Number(score),
                        })
                    )
                    .filter((e) => !isNaN(e.id)),
            };
        } catch (error) {
            throw new InternalServerError(undefined, undefined, [
                {
                    message: SearchErrors.SEARCH_FAILED.message,
                    code: SearchErrors.SEARCH_FAILED.code,
                },
            ]);
        }
    }

    /**
     * @param {number|string} eventId
     */
    async sync(eventId) {
        const id = Number(eventId);
        if (isNaN(id)) {
            return;
        }

        const event = await this.#eventRepository.findById(id, {
            include: {
                venue: { include: { governorate: true } },
                category: true,
                organizer: true,
                eventTags: { include: { tag: true } },
                ticketTypes: { select: { price: true } },
                eventSessions: true,
            },
        });

        if (!event) {
            await this.remove(id);
            return;
        }

        const store = await this.#getStore();
        if (!store) {
            throw new InternalServerError(undefined, undefined, [SearchErrors.SEARCH_FAILED]);
        }

        try {
            await store.delete({ filter: { eventId: id } }).catch(() => {});
            
            await store.addDocuments([this.#toDocument(event)], { ids: [randomUUID()] });
        } catch (error) {
            throw new InternalServerError(undefined, undefined, [EventErrors.EVENT_UPDATE_FAILED]);
        }
    }

    /**
     * @param {number[]} eventIds
     */
    async syncMany(eventIds) {
        const ids = eventIds.map(Number).filter((id) => !isNaN(id));
        if (!ids.length) return;

        const events = await this.#eventRepository.findMany({
            where: { id: { in: ids } },
            include: {
                venue: { include: { governorate: true } },
                category: true,
                organizer: true,
                eventTags: { include: { tag: true } },
                ticketTypes: { select: { price: true } },
                eventSessions: true,
            },
        });

        if (!events.length) return;

        const store = await this.#getStore();
        if (!store) {
            throw new InternalServerError(undefined, undefined, [SearchErrors.SEARCH_FAILED]);
        }

        try {
            await Promise.all(
                events.map((event) =>
                    store.delete({ filter: { eventId: Number(event.id) } }).catch(() => {})
                )
            );

            const documents = events.map((event) => this.#toDocument(event));
            const uuids = events.map(() => randomUUID());

            await store.addDocuments(documents, { ids: uuids });
        } catch (error) {
            throw new InternalServerError(undefined, undefined, [EventErrors.EVENT_UPDATE_FAILED]);
        }
    }

    /**
     * @param {number|string} eventId
     */
    async remove(eventId) {
        const id = Number(eventId);
        if (isNaN(id)) return;

        const store = await this.#getStore();
        if (!store) return;

        try {
            await store.delete({ filter: { eventId: id } });
        } catch (error) {
        }
    }

    /**
     * @param {EventModel | any} event
     * @returns {Document}
     */
    #toDocument(event) {
        const prices = Array.isArray(event.ticketTypes)
            ? event.ticketTypes.map((t) => Number(t.price)).filter((p) => isFinite(p))
            : [];

        const sessions = Array.isArray(event.eventSessions) ? event.eventSessions : [];
        const futureSessions = sessions
            .filter((s) => s.status === 'active' && new Date(s.startDate) >= new Date())
            .map((s) => new Date(s.startDate).getTime())
            .sort((a, b) => a - b);

        const tagNames = (event.eventTags || [])
            .map((et) => et.tag?.name)
            .filter(Boolean)
            .join(', ');

        const content = [
            `search_document: ${event.title}`,
            event.description,
            `Located at ${event.venue?.name || ''} in ${event.venue?.city || ''}.`,
            `Category: ${event.category?.name || ''}.`,
            tagNames ? `Keywords: ${tagNames}.` : '',
            event.hasSeatMap ? 'This is a seated event with a map.' : 'This is an open floor event.',
        ]
            .filter(Boolean)
            .join(' ');

        return new Document({
            pageContent: content,
            metadata: {
                eventId: Number(event.id),
                organizerId: event.organizerId,
                categoryId: event.categoryId ?? null,
                hasSeatMap: Boolean(event.hasSeatMap),
                minTicketPrice: prices.length ? Math.min(...prices) : null,
                maxTicketPrice: prices.length ? Math.max(...prices) : null,
                governorateName: event.venue?.governorate?.name || null,
                nextSessionDate: futureSessions.length ? futureSessions[0] : null,
            },
        });
    }

    /**
     * @returns {Promise<PGVectorStore | null>}
     */
    async #getStore() {
        if (this.#store) return this.#store;
        if (this.#storeUnavailable || !DATABASE_URL) return null;

        if (!this.#storeInitPromise) {
            this.#storeInitPromise = this.#aiService.createVectorStore({
                connectionString: DATABASE_URL,
                tableName: TABLE_NAME,
                columns: {
                    idColumnName: 'id',
                    contentColumnName: 'content',
                    metadataColumnName: 'metadata',
                    vectorColumnName: 'embedding',
                },
                scoreNormalization: 'similarity',
            });
        }

        try {
            this.#store = await this.#storeInitPromise;
            return this.#store;
        } catch (error) {
            this.#storeUnavailable = true;
            return null;
        } finally {
            this.#storeInitPromise = null;
        }
    }

    /**
     * @param {any} store - Type any to access internal langchain builder
     * @param {object} filter
     * @returns {Promise<number>}
     */
    async #countMatches(store, filter) {
        try {
            const { whereClauses, parameters } = store.buildFilterClauses(filter);
            // @ts-ignore - internal langchain property
            const tableName = store.computedTableName;

            return this.#eventRepository.countVectorMatches(tableName, whereClauses, parameters);
        } catch {
            return 0;
        }
    }

    /**
     * @param {SearchFilters} filters
     * @returns {object}
     */
    #buildVectorFilter(filters) {
        const vf = {};
        if (filters.categoryId !== undefined) vf.categoryId = filters.categoryId;
        if (filters.organizerId) vf.organizerId = filters.organizerId;
        if (filters.hasSeatMap !== undefined) vf.hasSeatMap = filters.hasSeatMap;
        if (filters.minPrice !== undefined) vf.maxTicketPrice = { gte: filters.minPrice };
        if (filters.maxPrice !== undefined) vf.minTicketPrice = { lte: filters.maxPrice };
        if (filters.location) vf.governorateName = filters.location.toUpperCase();

        if (filters.date) {
            const range = this.#calculateDateRange(filters.date);
            if (range) {
                vf.nextSessionDate = {
                    gte: range.start.getTime(),
                    lte: range.end.getTime(),
                };
            }
        }

        return vf;
    }

    /**
     * @param {string} dateKeyword
     * @returns {{ start: Date, end: Date } | null}
     */
    #calculateDateRange(dateKeyword) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        switch (dateKeyword.toLowerCase()) {
            case 'today':
                return { start, end };
            case 'tomorrow':
                start.setDate(start.getDate() + 1);
                end.setDate(end.getDate() + 1);
                return { start, end };
            case 'next week':
                end.setDate(end.getDate() + 7);
                return { start, end };
            case 'next month':
                end.setMonth(end.getMonth() + 1);
                return { start, end };
            default:
                return null;
        }
    }
}

export default new EventEmbeddingService(eventRepository, aiService);
export { EventEmbeddingService };
