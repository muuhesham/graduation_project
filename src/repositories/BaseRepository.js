//@ts-check

import { buildPagination } from '../utils/pagination.js';

/**
 * @typedef {import('./drivers/IDriver.js').default} IDriver
 * @typedef {import('./../types/shared/common.types.js').PaginationQuery} PaginationQuery
 * @typedef {import('./../types/shared/common.types.js').RepositoryModelClass<any>} RepositoryModelClass
 * @typedef {import('./../types/shared/common.types.js').RepositoryReadOptions<any>} RepositoryReadOptions
 * @typedef {import('./../types/shared/common.types.js').RepositoryFindUniqueOptions<any>} RepositoryFindUniqueOptions
 */

/**
 * @typedef {object} RepositoryConfig
 * @property {string} [modelName]
 * @property {import('./../types/shared/common.types.js').RepositorySort} [defaultSort]
 * @property {PaginationQuery} [defaultPagination]
 * @property {string[]} [searchFields]
 */

/**
 * @abstract
 * @template T - Model instance type
 * @template C - Create input type
 * @template U - Update input type
 * @template {object} W - Where unique input type
 * @template [TSelect=any] - Select type (Prisma.ModelSelect)
 * @template [TInclude=any] - Include type (Prisma.ModelInclude)
 * @template [TOmit=any] - Omit type (Prisma.ModelOmit)
 */
export default class BaseRepository {
    /**
     * @param {IDriver} driver
     * @param {RepositoryModelClass} ModelClass
     * @param {RepositoryConfig} [options]
     */
    constructor(driver, ModelClass, options = {}) {
        /** @type {IDriver} */
        this.driver = driver;
        /** @type {RepositoryModelClass} */
        this.ModelClass = ModelClass;
        this.resource = options.modelName || this.ModelClass.resourceName;
        this.defaultSort = options.defaultSort || { field: 'createdAt', order: 'desc' };
        this.defaultPagination = options.defaultPagination || { page: 1, limit: 10 };
        this.searchFields = Array.isArray(options.searchFields) ? options.searchFields : [];
        this.trashField = ModelClass.softDeleteField;
        this._withTrashed = false;
    }

    /**
     * Include soft-deleted records in the next query.
     * @returns {this}
     */
    withTrashed() {
        this._withTrashed = true;
        return this;
    }

    /**
     * @protected
     * @param {any} data
     * @returns {T | null}
     */
    _hydrate(data) {
        if (!data) return null;
        return new this.ModelClass(data);
    }

    /**
     * @protected
     * @param {any[]} items
     * @returns {T[]}
     */
    _hydrateMany(items = []) {
        return /** @type {T[]} */ (items.map((item) => this._hydrate(item)).filter(Boolean));
    }

    /**
     * @protected
     * @param {PaginationQuery} [pagination]
     * @returns {{ page: number, limit: number }}
     */
    _resolvePagination(pagination) {
        const page = Number(pagination?.page ?? this.defaultPagination.page ?? 1);
        const limit = Number(pagination?.limit ?? this.defaultPagination.limit ?? 10);

        return {
            page: Number.isFinite(page) && page > 0 ? page : 1,
            limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
        };
    }

    /**
     * @protected
     * @param {import('./../types/shared/common.types.js').RepositoryReadOptions<object>} [options]
     * @returns {{ page?: number, limit?: number } | undefined}
     */
    _paginationAliases(options = {}) {
        if (options.page != null || options.limit != null) {
            return {
                page: options.page,
                limit: options.limit,
            };
        }

        return undefined;
    }

    /**
     * @protected
     * @param {import('./../types/shared/common.types.js').RepositoryReadOptions<object>} [options]
     * @returns {object | undefined}
     */
    _implicitWhere(options = {}) {
        if (options.where) {
            return options.where;
        }

        const { select, include, omit, sort, pagination, page, limit, q, where, ...rest } = options;

        const filtered = Object.fromEntries(
            Object.entries(rest).filter(([, value]) => value !== undefined)
        );

        return Object.keys(filtered).length ? filtered : undefined;
    }

    /**
     * @protected
     * @param {import('./../types/shared/common.types.js').RepositoryReadOptions<object>} [options]
     * @param {{ applyDefaultSort?: boolean }} [config]
     * @returns {import('./../types/shared/common.types.js').RepositoryReadOptions<object>}
     */
    _normalizeQueryOptions(options = {}, config = {}) {
        /** @type {import('./../types/shared/common.types.js').RepositoryReadOptions<object>} */
        const query = {};

        const where = this._searchWhere(this._implicitWhere(options), options.q);
        if (where) {
            query.where = where;
        }

        if (options.select) {
            query.select = options.select;
        }

        if (options.include) {
            query.include = options.include;
        }

        if (options.omit) {
            query.omit = options.omit;
        }

        const pagination = options.pagination || this._paginationAliases(options);
        if (pagination) {
            query.pagination = this._resolvePagination(pagination);
        }

        if (options.sort) {
            query.sort = options.sort;
        } else if (config.applyDefaultSort && this.defaultSort?.field) {
            query.sort = this.defaultSort;
        }

        return query;
    }

    /**
     * @protected
     * @param {object | undefined} where
     * @param {string | undefined} q
     * @returns {object | undefined}
     */
    _searchWhere(where, q) {
        if (!q || !this.searchFields.length) {
            return where;
        }

        const searchClause = {
            OR: this.searchFields.map((field) => ({
                [field]: {
                    contains: q,
                    mode: 'insensitive',
                },
            })),
        };

        return {
            ...(where || {}),
            AND: [
                ...(Array.isArray(where?.AND) ? where.AND : where?.AND ? [where.AND] : []),
                searchClause,
            ],
        };
    }

    /**
     * @protected
     * @param {object} [where]
     * @return {object}
     */
    _applyScopes(where = {}) {
        if (!this.trashField) {
            return where;
        }

        /** @type {Record<string, any>} */
        const scopes = {};

        if (this._withTrashed) {
            scopes[this.trashField] = undefined;
        } else {
            scopes[this.trashField] = null;
        }

        this._withTrashed = false;
        return { ...where, ...scopes };
    }

    /**
     * @param {C} data
     * @param {any} [tx]
     * @returns {Promise<T>}
     */
    async create(data, tx = null) {
        const result = await this.driver.create(this.resource, data, tx);
        return /** @type {T} */ (this._hydrate(result));
    }

    /**
     * @param {{ data: C[], skipDuplicates?: boolean }} options
     * @param {any} [tx]
     */
    async bulkInsert(options, tx = null) {
        return this.driver.createMany(
            this.resource,
            options.data,
            {
                skipDuplicates: options.skipDuplicates,
            },
            tx
        );
    }

    /**
     * @param {import('./../types/shared/common.types.js').RepositoryFindUniqueOptions<W, TSelect, TInclude, TOmit>} options
     * @returns {Promise<T | null>}
     */
    async findUnique(options) {
        const query = this._normalizeQueryOptions(options);

        query.where = this._applyScopes(query.where);

        const result = await this.driver.findUnique(
            this.resource,
            /** @type {import('./../types/shared/common.types.js').RepositoryFindUniqueOptions<object, any, any>} */ (
                query
            )
        );
        return this._hydrate(result);
    }

    /**
     * @param {import('./../types/shared/common.types.js').RepositoryReadOptions<object, TSelect, TInclude, TOmit>} [options]
     * @returns {Promise<T | null>}
     */
    async findOne(options = {}) {
        const query = this._normalizeQueryOptions(options);
        query.where = this._applyScopes(query.where);

        const result = await this.driver.findOne(this.resource, query);
        return this._hydrate(result);
    }

    /**
     * @param {import('./../types/shared/common.types.js').RepositoryReadOptions<object, TSelect, TInclude, TOmit>} [options]
     * @returns {Promise<T[]>}
     */
    async findMany(options = {}) {
        const query = this._normalizeQueryOptions(options);
        query.where = this._applyScopes(query.where);

        const results = await this.driver.findMany(this.resource, query);
        return this._hydrateMany(results);
    }

    /**
     * @param {import('./../types/shared/common.types.js').RepositoryReadOptions<object, TSelect, TInclude, TOmit>} [options]
     * @returns {Promise<{ data: T[], pagination: import('./../types/shared/common.types.js').PaginationMeta }>}
     */
    async paginate(options = {}) {
        const pagination = this._resolvePagination(
            options.pagination || this._paginationAliases(options)
        );
        const query = this._normalizeQueryOptions(options, { applyDefaultSort: true });

        query.where = this._applyScopes(query.where);

        const [data, total] = await Promise.all([
            this.driver.findMany(this.resource, query),
            this.driver.count(this.resource, { where: query.where }),
        ]);

        return {
            data: this._hydrateMany(data),
            pagination: buildPagination({
                total,
                page: pagination.page,
                limit: pagination.limit,
            }),
        };
    }

    /**
     * @param {object} [args]
     * @returns {Promise<any>}
     */
    async aggregate(args = {}) {
        return this.driver.aggregate(this.resource, args);
    }

    /**
     * @param {import('./../types/shared/common.types.js').RepositoryCountOptions<object>} [options]
     * @returns {Promise<number>}
     */
    async count(options = {}) {
        return this.driver.count(this.resource, { where: options.where });
    }

    /**
     * @param {{ where: W, data: U }} options
     * @returns {Promise<T>}
     */
    async update(options) {
        const result = await this.driver.update(this.resource, options.where, options.data);
        return /** @type {T} */ (this._hydrate(result));
    }

    /**
     * @param {{ where: object, data: U }} options
     * @param {any} [tx]
     */
    async updateMany(options, tx = null) {
        return this.driver.updateMany(this.resource, options.where, options.data, tx);
    }

    /**
     * @param {{ where: W }} options
     * @returns {Promise<T>}
     */
    async delete(options) {
        const result = await this.driver.delete(this.resource, options.where);
        return /** @type {T} */ (this._hydrate(result));
    }

    /**
     * @param {{ where: object }} options
     */
    async deleteMany(options) {
        return this.driver.deleteMany(this.resource, options.where);
    }

    /**
     * @template TR
     * @param {(tx: any) => Promise<TR>} work
     * @returns {Promise<TR>}
     */
    async runInTransaction(work) {
        return this.driver.runInTransaction(work);
    }

    /**
     * @param {string} sql
     * @param {any[]} [params]
     * @returns {Promise<any[]>}
     */
    async rawQuery(sql, params = []) {
        if (!this.driver.rawQuery) {
            throw new Error(`Driver ${this.constructor.name} does not support rawQuery`);
        }

        const result = await this.driver.rawQuery(sql, params);
        return result || [];
    }
}
