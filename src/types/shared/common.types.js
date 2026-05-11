// @ts-check

/**
 * @typedef {object} PaginationQuery
 * @property {number} [page]
 * @property {number} [limit]
 */

/**
 * @typedef {object} RepositorySort
 * @property {string} field
 * @property {'asc' | 'desc'} [order]
 */

/**
 * @template TInstance
 * @template [TData=any]
 * @template [TSelect=any]
 * @template [TInclude=any]
 * @template [TOmit=any]
 * @typedef {{ new (data: any): TInstance, resourceName: string, softDeleteField: string | null }} RepositoryModelClass
 */

/**
 * @template [TWhere=any]
 * @template [TSelect=any]
 * @template [TInclude=any]
 * @template [TOmit=any]
 * @template [TData=any]
 * @typedef {object} RepositoryReadOptions
 * @property {TWhere} [where]
 * @property {TSelect} [select]
 * @property {TInclude} [include]
 * @property {TOmit} [omit]
 * @property {RepositorySort} [sort]
 * @property {PaginationQuery} [pagination]
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [q]
 */

/**
 * @template [TSelect=any]
 * @template [TInclude=any]
 * @template [TOmit=any]
 * @typedef {object} RepositoryProjection
 * @property {TSelect} [select]
 * @property {TInclude} [include]
 * @property {TOmit} [omit]
 */

/**
 * @template [TWhere=any]
 * @template [TSelect=any]
 * @template [TInclude=any]
 * @template [TOmit=any]
 * @typedef {RepositoryReadOptions<TWhere, TSelect, TInclude, TOmit> & { where: TWhere }} RepositoryFindUniqueOptions
 */

/**
 * @template [TWhere=any]
 * @template [TSelect=any]
 * @template [TInclude=any]
 * @template [TOmit=any]
 * @typedef {RepositoryReadOptions<TWhere, TSelect, TInclude, TOmit>} DriverFindQuery
 */

/**
 * @template [TWhere=any]
 * @typedef {object} RepositoryPageQuery
 * @property {TWhere} [where]
 * @property {PaginationQuery} [pagination]
 */

/**
 * @template [TWhere=any]
 * @typedef {object} RepositoryCountOptions
 * @property {TWhere} [where]
 */

/**
 * @template [TWhere=any]
 * @template [TData=any]
 * @typedef {object} RepositoryMutationOptions
 * @property {TWhere} where
 * @property {TData} data
 */

/**
 * @typedef {object} BulkInsertOptions
 * @property {boolean} [skipDuplicates]
 */

/**
 * @typedef {object} PaginationMeta
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 * @property {boolean} hasNext
 * @property {boolean} hasPrev
 * @property {number | null} nextPage
 * @property {number | null} prevPage
*/

/**
 * @template [T=any]
 * @typedef {T} TransactionClient
 */

/**
 * @template TItem
 * @typedef {object} PaginatedResult
 * @property {TItem[]} data
 * @property {PaginationMeta} pagination
 */

/**
 * @template TItem
 * @typedef {object} BulkInsertResult
 * @property {number} count
 * @property {TItem[]} [data]
 */

export {};
