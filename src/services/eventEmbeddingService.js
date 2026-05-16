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
            console.warn('[Embedding] Invalid eventId:', eventId);
            return;
        }

        console.log(`[Embedding] Syncing event ${id}...`);
        const event = await this.#eventRepository.findById(id, {
            include: {
                venue: true,
                category: true,
                organizer: true,
                eventTags: { include: { tag: true } },
                ticketTypes: { select: { price: true } },
            },
        });

        if (!event) {
            console.log(`[Embedding] Event ${id} not found for sync. Deleting from index.`);
            await this.remove(id);
            return;
        }

        const store = await this.#getStore();
        if (!store) {
            console.error(`[Embedding] Store not available for event ${id}`);
            throw new InternalServerError(undefined, undefined, [SearchErrors.SEARCH_FAILED]);
        }

        try {
            console.log(`[Embedding] Deleting old index for event ${id}...`);
            await store.delete({ filter: { eventId: id } }).catch((err) => console.log(`[Embedding] Delete failed for ${id}:`, err.message));
            
            console.log(`[Embedding] Adding document for event ${id}...`);
            await store.addDocuments([this.#toDocument(event)], { ids: [randomUUID()] });
            console.log(`[Embedding] Event ${id} synced successfully.`);
        } catch (error) {
            console.error(`[Embedding] Failed to sync event ${id}:`, error.message);
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
            console.warn('[Embedding] Remove failed:', error.message);
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
            const message =
                error instanceof Error ? error.message : 'Failed to initialize PGVectorStore';
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
