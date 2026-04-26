//@ts-check

/**
 * @param {{ page?: number, limit?: number, total?: number }} [options]
 */
export function buildPagination(options = {}) {
    const page = Number(options.page ?? 1);
    const limit = Number(options.limit ?? 10);
    const total = Number(options.total ?? 0);
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    const hasNext = totalPages > 0 && page < totalPages;
    const hasPrev = page > 1 && totalPages > 0;

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null,
    };
}
