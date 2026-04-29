//@ts-check

import aiService from './aiService.js';
import cacheService from './cacheService.js';
import eventService from './eventService.js';
import eventEmbeddingService from './eventEmbeddingService.js';
import TimeoutError from '../errors/TimeoutError.js';
import { makePagination } from '../resources/helpers/pagination.js';

/**
 * @typedef {import('../types/search.types.js').SearchResult} SearchResult
 * @typedef {import('../types/search.types.js').SearchFilters} SearchFilters
 * @typedef {import('../types/search.types.js').SearchOptions} SearchOptions
 * @typedef {typeof import('./aiService.js').default} AIService
 * @typedef {typeof import('./cacheService.js').default} CacheService
 * @typedef {typeof import('./eventService.js').default} EventService
 * @typedef {typeof import('./eventEmbeddingService.js').default} EventEmbeddingService
 */

/**
 * @typedef {object} SearchServiceDeps
 * @property {object} services
 * @property {AIService} services.aiService
 * @property {CacheService} services.cacheService
 * @property {EventService} services.eventService
 * @property {EventEmbeddingService} services.eventEmbeddingService
 */

const SEARCH_STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'at', 'be', 'for', 'from', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'our', 'the', 'to', 'we', 'where', 'with', 'you', 'your'
]);

const KEYWORD_SEARCH_PATHS = [
    ['title'],
    ['description'],
    ['venue', 'name'],
    ['venue', 'city'],
    ['category', 'name'],
    ['eventTags', 'some', 'tag', 'name'],
];

class SearchService {
    #aiService;
    #cacheService;
    #eventService;
    #eventEmbeddingService;

    #CACHE_TTL = 60;
    #CACHE_PREFIX = 'search:embedding:';
    #MIN_QUERY_FOR_CACHE = 12;

    /**
     * @param {SearchServiceDeps} deps
     */
    constructor({ services }) {
        this.#aiService = services.aiService;
        this.#cacheService = services.cacheService;
        this.#eventService = services.eventService;
        this.#eventEmbeddingService = services.eventEmbeddingService;
    }

    /**
     * @param {SearchOptions} options
     * @returns {Promise<SearchResult>}
     */
    async search({ query, limit, page, filters = {} }) {
        const semanticQuery = this.#prepareSemanticQuery(query);
        const pagination = { page, limit };

        const aiResult = await this.#trySemanticSearch(semanticQuery, filters, pagination);

        if (aiResult?.data?.length) {
            return aiResult;
        }

        return this.#performKeywordSearch(query, filters, pagination);
    }

    /**
     * @param {string} query
     * @returns {string}
     */
    #prepareSemanticQuery(query) {
        const keywords = query
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .map((word) => word.trim())
            .filter((word) => word.length > 2 && !SEARCH_STOP_WORDS.has(word));

        return keywords.length ? keywords.join(' ') : query;
    }

    /**
     * @param {string} query
     * @param {SearchFilters} filters
     * @param {{ page: number, limit: number }} pagination
     * @returns {Promise<SearchResult | null>}
     */
    async #trySemanticSearch(query, filters, pagination) {
        try {
            const embedding = await this.#getEmbedding(query);
            
            const result = await this.#eventEmbeddingService.searchByEmbedding(embedding, {
                filters,
                limit: pagination.limit,
                page: pagination.page,
            });

            if (!result || !result.events?.length) return null;

            const hydrated = await this.#eventService.hydrateMatches(result.events);

            return {
                data: hydrated,
                pagination: makePagination({
                    total: result.total,
                    page: pagination.page,
                    limit: pagination.limit
                }),
            };
        } catch (error) {
            if (error instanceof TimeoutError || (error instanceof Error && error.name === 'AbortError')) {
                throw error;
            }
            
            const message = error instanceof Error ? error.message : String(error);
            console.error('[SearchService] AI search failed:', message);
            return null;
        }
    }

    /**
     * @param {string} query
     * @returns {Promise<number[]>}
     */
    #getEmbedding(query) {
        if (query.trim().length < this.#MIN_QUERY_FOR_CACHE) {
            return this.#aiService.embed(query);
        }

        return this.#cacheService.remember(
            `${this.#CACHE_PREFIX}${query.toLowerCase()}`,
            () => this.#aiService.embed(query),
            this.#CACHE_TTL
        );
    }

    /**
     * @param {string} query
     * @param {SearchFilters} filters
     * @param {{ page: number, limit: number }} pagination
     * @returns {Promise<SearchResult>}
     */
    #performKeywordSearch(query, filters, pagination) {
        const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const filterClause = this.#buildFilterClause(filters);

        const orConditions = terms.flatMap(term => 
            KEYWORD_SEARCH_PATHS.map(path => this.#buildNestedWhere(path, { contains: term, mode: 'insensitive' }))
        );

        const where = orConditions.length ? { OR: orConditions, ...filterClause } : filterClause;

        return this.#eventService.searchByKeywords({ where, pagination });
    }

    /**
     * @param {string[]} path
     * @param {any} value
     * @returns {object}
     */
    #buildNestedWhere(path, value) {
        const keys = [...path];
        const lastKey = keys.pop();
        if (!lastKey) return {};
        
        let nested = { [lastKey]: value };
        while (keys.length) {
            const key = keys.pop();
            if (key) {
                nested = { [key]: nested };
            }
        }
        return nested;
    }

    /**
     * @param {SearchFilters} filters
     * @returns {object}
     */
    #buildFilterClause(filters) {
        const clause = {};
        if (filters.categoryId !== undefined) clause.categoryId = filters.categoryId;
        if (filters.organizerId) clause.organizerId = filters.organizerId;
        if (filters.hasSeatMap !== undefined) clause.hasSeatMap = filters.hasSeatMap;
        
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            clause.ticketTypes = {
                some: {
                    price: {
                        ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
                        ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {})
                    }
                }
            };
        }

        if (Array.isArray(filters.tags) && filters.tags.length) {
            clause.eventTags = {
                some: { tag: { name: { in: filters.tags.map(t => t.toLowerCase()) } } }
            };
        }

        return clause;
    }
}

export default new SearchService({
    services: { aiService, cacheService, eventService, eventEmbeddingService }
});
export { SearchService };
