//@ts-check

/**
 * @typedef {import('./../../types/shared').PaginationMeta} PaginationMeta
 */

/**
 * @typedef {object} PaginationInput
 * @property {number | string} total
 * @property {number | string} [page]
 * @property {number | string} [limit]
 * @property {number | string} [totalPages]
 * @property {boolean} [hasNext]
 * @property {boolean} [hasPrev]
 * @property {number | null} [nextPage]
 * @property {number | null} [prevPage]
 */

/**
 * @param {PaginationInput} input
 * @returns {PaginationMeta}
 */
export function makePagination(input) {
    const total = Number(input.total || 0);
    const page = Number(input.page || 1);
    const limit = Number(input.limit || 20);
    const totalPages = Number(input.totalPages || Math.ceil(total / limit) || 0);

    return {
        total,
        page,
        limit,
        totalPages,
        hasNext: input.hasNext ?? (page * limit < total),
        hasPrev: input.hasPrev ?? (page > 1),
        nextPage: input.nextPage ?? (page * limit < total ? page + 1 : null),
        prevPage: input.prevPage ?? (page > 1 ? page - 1 : null),
    };
}
