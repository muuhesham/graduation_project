/** Search-related shared typedefs. */

/** @typedef {{ name?: string | null; city?: string | null }} IndexableVenue */

/** @typedef {{ name?: string | null }} IndexableCategory */

/** @typedef {{ price?: number | string | null }} IndexableTicketType */

/** @typedef {{ tag?: { name?: string | null } | null }} IndexableEventTag */

/**
 * @typedef {Object} IndexableEvent
 * @property {number | string} id
 * @property {string} organizerId
 * @property {number | null | undefined} [categoryId]
 * @property {boolean | null | undefined} [hasSeatMap]
 * @property {string} title
 * @property {string} slug
 * @property {string | null | undefined} [description]
 * @property {string | null | undefined} [type]
 * @property {string | null | undefined} [mode]
 * @property {IndexableVenue | null | undefined} [venue]
 * @property {IndexableCategory | null | undefined} [category]
 * @property {IndexableEventTag[] | null | undefined} [eventTags]
 * @property {IndexableTicketType[] | null | undefined} [ticketTypes]
 */

/**
 * @typedef {import('./models/event.model').Event & {
 *     slug?: string | null;
 *     description?: string | null;
 *     createdAt?: string | Date | null;
 *     hasSeatMap?: boolean | null;
 *     bannerUrl?: string | null;
 *     venue?: { name?: string | null; city?: string | null } | null;
 *     ticketTypes?: any[] | null;
 *     eventTags?: any[] | null;
 *     isInterested?: boolean | null;
 *     similarity?: number | null;
 * }} SearchEvent
 */

/**
 * Shared search filters
 *
 * @typedef {Object} SearchFilters
 * @property {number} [categoryId]
 * @property {string} [organizerId]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {boolean} [hasSeatMap]
 * @property {string[]} [tags]
 */

/**
 * Validated search query shape after express-validator sanitization/defaulting
 *
 * @typedef {SearchFilters & {
 *     q: string;
 *     page: number;
 *     limit: number;
 * }} ValidatedSearchQuery
 */

/**
 * Shared pagination input
 *
 * @typedef {Object} SearchPagination
 * @property {number} page
 * @property {number} limit
 */

/**
 * Pagination metadata interface
 *
 * @typedef {Object} PaginationMeta
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} total - Total items count
 * @property {number} totalPages - Total pages count
 * @property {boolean} hasNext - Has next page
 * @property {boolean} hasPrev - Has previous page
 */

/**
 * Search service response shape
 *
 * @typedef {Object} SearchResult
 * @property {SearchEvent[]} data - Array of search events before resource transformation
 * @property {PaginationMeta} pagination - Pagination metadata
 */

/**
 * Search service options interface
 *
 * @typedef {Object} SearchOptions
 * @property {number} limit
 * @property {number} page
 * @property {SearchFilters} [filters] - Additional filters
 * @property {string} query - Search query text
 */

export {};
