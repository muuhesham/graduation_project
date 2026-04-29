//@ts-check

/**
 * @typedef {import('./../../types/shared/common.types.js').PaginationMeta} PaginationMeta
 */

/**
 * @param {PaginationMeta | null | undefined} pagination
 * @returns {PaginationMeta}
 */
export function makePagination(pagination) {
    return {
        total: Number(pagination?.total ?? 0),
        page: Number(pagination?.page ?? 1),
        limit: Number(pagination?.limit ?? 20),
        totalPages: Number(pagination?.totalPages ?? 0),
        hasNext: Boolean(pagination?.hasNext),
        hasPrev: Boolean(pagination?.hasPrev),
        nextPage: pagination?.nextPage ?? null,
        prevPage: pagination?.prevPage ?? null,
    };
}
