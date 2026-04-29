//@ts-check

import { randomUUID } from 'node:crypto';
import { Document } from '@langchain/core/documents';
import aiService from './aiService.js';
import { eventRepository } from '../repositories/index.js';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import { DATABASE_URL } from '../config/env.js';
import SearchErrors from '../constants/messages/errors/search.js';
import EventErrors from '../constants/messages/errors/event.js';

/**
 * @typedef {import('../types/search.types.js').IndexableEvent} IndexableEvent
 * @typedef {typeof import('./aiService.js').default} AIService
 * @typedef {import('../repositories/EventRepository.js').default} EventRepository
 * @typedef {import('../types/search.types.js').SearchFilters} SearchFilters
 * @typedef {import('@langchain/community/vectorstores/pgvector').PGVectorStore} PGVectorStore
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
        
        const normalizedLimit = Math.min(MAX_SEARCH_LIMIT, Math.max(1, Number(limit) || DEFAULT_SEARCH_LIMIT));
        const offset = (Math.max(1, Number(page) || 1) - 1) * normalizedLimit;
        
        const vectorFilter = this.#buildVectorFilter(filters);
        const store = await this.#getStore();

        if (!store) {
            throw new InternalServerError(undefined, undefined, [{
                message: SearchErrors.SEARCH_FAILED.message,
                code: SearchErrors.SEARCH_FAILED.code
            }]);
        }

        try {
            const [matches, total] = await Promise.all([
                store.similaritySearchVectorWithScore(embedding, offset + normalizedLimit, vectorFilter),
                this.#countMatches(store, vectorFilter)
            ]);

            return {
                total,
                events: matches.slice(offset).map(
                    /** @param {[Document, number]} result */
                    ([doc, score]) => ({
                        id: Number(doc.metadata?.eventId),
                        similarity: Number(score),
                    })
                ).filter(e => !isNaN(e.id))
            };
        } catch (error) {
            throw new InternalServerError(undefined, undefined, [{
                message: SearchErrors.SEARCH_FAILED.message,
                code: SearchErrors.SEARCH_FAILED.code
            }]);
        }
    }

    /**
     * @param {number} eventId
     */
    async sync(eventId) {
        const event = await this.#eventRepository.findById(eventId, {
            include: {
                venue: true,
                category: true,
                eventTags: { include: { tag: true } },
                ticketTypes: { select: { price: true } },
            },
        });

        if (!event) {
            throw new NotFoundError(undefined, undefined, [{
                message: EventErrors.EVENT_NOT_FOUND.message,
                code: EventErrors.EVENT_NOT_FOUND.code
            }]);
        }

        const store = await this.#getStore();
        if (!store) {
            throw new InternalServerError(undefined, undefined, [{
                message: SearchErrors.SEARCH_FAILED.message,
                code: SearchErrors.SEARCH_FAILED.code
            }]);
        }

        try {
            await store.delete({ filter: { eventId: Number(event.id) } }).catch(() => {});
            await store.addDocuments([this.#toDocument(event)], { ids: [randomUUID()] });
        } catch (error) {
            throw new InternalServerError(undefined, undefined, [{
                message: EventErrors.EVENT_UPDATE_FAILED.message,
                code: EventErrors.EVENT_UPDATE_FAILED.code
            }]);
        }
    }

    /**
     * @param {number} eventId
     */
    async remove(eventId) {
        const store = await this.#getStore();
        if (!store) {
            throw new InternalServerError(undefined, undefined, [{
                message: SearchErrors.SEARCH_FAILED.message,
                code: SearchErrors.SEARCH_FAILED.code
            }]);
        }

        try {
            await store.delete({ filter: { eventId: Number(eventId) } });
        } catch (error) {
            throw new InternalServerError(undefined, undefined, [{
                message: EventErrors.EVENT_DELETION_FAILED.message,
                code: EventErrors.EVENT_DELETION_FAILED.code
            }]);
        }
    }

    /**
     * @param {IndexableEvent | any} event
     * @returns {Document}
     */
    #toDocument(event) {
        const prices = Array.isArray(event.ticketTypes)
            ? event.ticketTypes.map(t => Number(t.price)).filter(p => isFinite(p))
            : [];

        const tagNames = (event.eventTags || []).map(et => et.tag?.name).filter(Boolean).join(' ');
        
        const content = [
            event.title,
            event.description,
            event.venue?.name || '',
            event.venue?.city || '',
            event.category?.name || '',
            tagNames,
            event.hasSeatMap ? 'seated event seat map' : 'open floor',
        ].filter(Boolean).join(' ');

        return new Document({
            pageContent: content,
            metadata: {
                eventId: Number(event.id),
                organizerId: event.organizerId,
                categoryId: event.categoryId ?? null,
                hasSeatMap: Boolean(event.hasSeatMap),
                minTicketPrice: prices.length ? Math.min(...prices) : null,
                maxTicketPrice: prices.length ? Math.max(...prices) : null,
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
            // @ts-ignore - Dynamic initialize call
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
            const message = error instanceof Error ? error.message : 'Failed to initialize PGVectorStore';
            console.error('[VectorStore]', message);
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
        return vf;
    }
}

export default new EventEmbeddingService(eventRepository, aiService);
export { EventEmbeddingService };
