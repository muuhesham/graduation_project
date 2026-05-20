// @ts-check

import { pluck } from '../../helpers/pluck.js';

/**
 * @typedef {Object} SearchQueryDTO
 * @property {string} query - Search query string
 * @property {number} [page=1] - Page number. Default is `1`
 * @property {number} [limit=10] - Results per page. Default is `10`
 * @property {string} [categoryId] - Optional category filter
 * @property {string} [organizerId] - Optional organizer filter
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page - Current page number
 * @property {number} limit - Results per page
 * @property {number} total - Total number of results
 * @property {number} totalPages - Total number of pages
 */

/**
 * @typedef {Object} SearchResponseDTO
 * @property {Event[]} data - Array of events
 * @property {PaginationParams} pagination - Pagination metadata
 */

/**
 * @typedef {Object} SearchFiltersDTO
 * @property {number} [categoryId]
 * @property {string} [organizerId]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {boolean} [hasSeatMap]
 * @property {string[]} [tags]
 * @property {string} [date]
 */

export const SEARCH_FILTER_KEYS = [
    'categoryId',
    'organizerId',
    'minPrice',
    'maxPrice',
    'hasSeatMap',
    'tag',
    'tags',
    'date',
    'location',
];

/**
 * @param {unknown} q
 * @returns {{ query: string; pageOverride?: string; limitOverride?: string }}
 */
export function normalizeSearchQueryInput(q) {
    const rawQuery =
        typeof q === 'string' ? q : Array.isArray(q) && typeof q[0] === 'string' ? q[0] : '';

    if (!rawQuery.includes('?')) {
        return { query: rawQuery };
    }

    const [queryText, embeddedParams] = rawQuery.split('?', 2);
    const params = new URLSearchParams(embeddedParams || '');

    return {
        query: queryText,
        pageOverride: params.get('page') || undefined,
        limitOverride: params.get('limit') || undefined,
    };
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
export function normalizeSearchTagValues(value) {
    const values = Array.isArray(value) ? value : [value];

    return values
        .flatMap((entry) => String(entry).split(','))
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Picks already-normalized search filters from validated query params.
 *
 * @param {Record<string, unknown>} query - Express query object
 * @returns {SearchFiltersDTO} Filter object for Prisma
 */
export function pickSearchFilters(query) {
    const pickedFilters = /** @type {Record<string, any>} */ (pluck(query, SEARCH_FILTER_KEYS));

    const tags = normalizeSearchTagValues(pickedFilters.tag || pickedFilters.tags || []);

    return {
        ...(pickedFilters.categoryId !== undefined ? { categoryId: Number(pickedFilters.categoryId) } : {}),
        ...(pickedFilters.organizerId ? { organizerId: String(pickedFilters.organizerId) } : {}),
        ...(pickedFilters.minPrice !== undefined ? { minPrice: parseFloat(String(pickedFilters.minPrice)) } : {}),
        ...(pickedFilters.maxPrice !== undefined ? { maxPrice: parseFloat(String(pickedFilters.maxPrice)) } : {}),
        ...(pickedFilters.hasSeatMap !== undefined ? { hasSeatMap: pickedFilters.hasSeatMap === 'true' || pickedFilters.hasSeatMap === true } : {}),
        ...(pickedFilters.date ? { date: String(pickedFilters.date) } : {}),
        ...(tags.length ? { tags } : {}),
    };
}

export {};
