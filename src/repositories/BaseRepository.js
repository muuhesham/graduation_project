//@ts-check

import { buildPagination } from '../utils/pagination.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/shared').PaginationQuery} PaginationQuery
 * @typedef {import('./../types/shared').RepositorySort} RepositorySort
 * @typedef {import('./../types/shared').PaginationMeta} PaginationMeta
 * @typedef {import('./../types/shared').TransactionClient} TransactionClient
 * @typedef {import('./../types/shared').RepositoryProjection<any, any, any>} RepositoryProjection
 */

/**
 * @template TInstance
 * @typedef {import('./../types/shared').RepositoryModelClass<TInstance>} RepositoryModelClass
 */

/**
 * @template TWhere, TSelect, TInclude, TOmit
 * @typedef {import('./../types/shared').RepositoryReadOptions<TWhere, TSelect, TInclude, TOmit>} ReadOptions
 */

/**
 * @template TWhere, TSelect, TInclude, TOmit
 * @typedef {import('./../types/shared').RepositoryFindUniqueOptions<TWhere, TSelect, TInclude, TOmit>} FindUniqueOptions
 */

/**
 * @template TItem
 * @typedef {import('./../types/shared').PaginatedResult<TItem>} PaginatedResult
 */

/**
 * @typedef {object} RepositoryConfig
 * @property {string} [modelName]
 * @property {RepositorySort} [defaultSort]
 * @property {PaginationQuery} [defaultPagination]
 * @property {string[]} [searchFields]
 * @property {RepositoryProjection} [mutationInclude]
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
    /** @type {import('../observers/BaseObserver').default<T>[]} */
    #observers = [];

    /**
     * @param {IDriver} driver
     * @param {RepositoryModelClass<T>} ModelClass
     * @param {RepositoryConfig} [options]
     */
    constructor(driver, ModelClass, options = {}) {
        /** @type {IDriver} */
        this.driver = driver;
        /** @type {RepositoryModelClass<T>} */
        this.ModelClass = ModelClass;
        this.resource = options.modelName || this.ModelClass.resourceName;
        this.defaultSort = options.defaultSort || { field: 'createdAt', order: 'desc' };
        this.defaultPagination = options.defaultPagination || { page: 1, limit: 10 };
        this.searchFields = Array.isArray(options.searchFields) ? options.searchFields : [];
        /** @type {RepositoryProjection | null} */
        this.mutationInclude = options.mutationInclude || null;
        this.trashField = ModelClass.softDeleteField;
        this._withTrashed = false;
    }

    /**
     * @param {import('../observers/BaseObserver').default<T>} observer
     */
    observe(observer) {
        this.#observers.push(observer);
    }

    /**
     * @protected
     * @param {'creating'|'created'|'updating'|'updated'|'deleting'|'deleted'|'saving'|'saved'} event
     * @param {C|U|T|null} model
     * @param {TransactionClient} [tx]
     */
    async _notify(event, model, tx) {
        if (!model) return;
        for (const observer of this.#observers) {
            const handler = /** @type {((model: any, tx?: any) => any) | undefined} */ (
                observer[event]
            );
            if (typeof handler === 'function') {
                await handler.call(observer, model, tx);
            }
        }
    }

    /**
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
     * @param {ReadOptions<any, any, any, any>} [options]
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
     * @param {ReadOptions<any, any, any, any>} [options]
     * @returns {object | undefined}
     */
    _implicitWhere(options = {}) {
        if (options.where) {
            return options.where;
        }

        const {
            select,
            include,
            omit,
            sort,
            pagination,
            page,
            limit,
            skip,
            take,
            orderBy,
            q,
            where,
            withDeleted,
            withTrashed,
            ...rest
        } = options;

        const filtered = Object.fromEntries(
            Object.entries(rest).filter(([, value]) => value !== undefined)
        );

        return Object.keys(filtered).length ? filtered : undefined;
    }

    /**
     * @protected
     * @param {ReadOptions<any, any, any, any>} [options]
     * @param {{ applyDefaultSort?: boolean }} [config]
     * @returns {ReadOptions<any, any, any, any>}
     */
    _normalizeQueryOptions(options = {}, config = {}) {
        /** @type {ReadOptions<any, any, any, any>} */
        const query = {};

        if (options.withDeleted || options.withTrashed) {
            this.withTrashed();
        }

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

        if (options.skip !== undefined) {
            query.skip = options.skip;
        }

        if (options.take !== undefined) {
            query.take = options.take;
        }

        if (options.orderBy !== undefined) {
            query.orderBy = options.orderBy;
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
     * @param {Record<string, any> | undefined} where
     * @param {string | undefined} q
     * @returns {Record<string, any> | undefined}
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
     * @param {Record<string, any>} [where]
     * @return {Record<string, any>}
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
     * @param {TransactionClient} [tx]
     * @returns {Promise<T>}
     */
    async create(data, tx = null) {
        await this._notify('creating', data, tx);
        await this._notify('saving', data, tx);

        const result = await this.driver.create(this.resource, data, tx, this.mutationInclude);
        const model = /** @type {T} */ (this._hydrate(result));

        await this._notify('created', model, tx);
        await this._notify('saved', model, tx);

        return model;
    }

    /**
     * @param {{ data: C[], skipDuplicates?: boolean }} options
     * @param {TransactionClient} [tx]
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
     * @param {FindUniqueOptions<any, TSelect, TInclude, TOmit>} options
     * @param {TransactionClient} [tx]
     * @returns {Promise<T | null>}
     */
    async findUnique(options, tx = null) {
        const query = this._normalizeQueryOptions(options);
        query.where = this._applyScopes(query.where);

        const result = await this.driver.findUnique(this.resource, /** @type {any} */ (query), tx);
        return this._hydrate(result);
    }

    /**
     * @param {ReadOptions<any, TSelect, TInclude, TOmit>} [options]
     * @param {TransactionClient} [tx]
     * @returns {Promise<T | null>}
     */
    async findOne(options = {}, tx = null) {
        const query = this._normalizeQueryOptions(options);
        query.where = this._applyScopes(query.where);

        const result = await this.driver.findOne(this.resource, query, tx);
        return this._hydrate(result);
    }

    /**
     * @param {ReadOptions<any, TSelect, TInclude, TOmit>} [options]
     * @param {TransactionClient} [tx]
     * @returns {Promise<T[]>}
     */
    async findMany(options = {}, tx = null) {
        const query = this._normalizeQueryOptions(options);
        query.where = this._applyScopes(query.where);

        const results = await this.driver.findMany(this.resource, query, tx);
        return this._hydrateMany(results);
    }

    /**
     * @param {ReadOptions<any, TSelect, TInclude, TOmit>} [options]
     * @param {TransactionClient} [tx]
     * @returns {Promise<PaginatedResult<T>>}
     */
    async paginate(options = {}, tx = null) {
        const pagination = this._resolvePagination(
            options.pagination || this._paginationAliases(options)
        );
        const query = this._normalizeQueryOptions(options, { applyDefaultSort: true });
        query.where = this._applyScopes(query.where);

        const [data, total] = await Promise.all([
            this.driver.findMany(this.resource, query, tx),
            this.driver.count(this.resource, { where: query.where }, tx),
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
     * @param {TransactionClient} [tx]
     * @returns {Promise<any>}
     */
    async aggregate(args = {}, tx = null) {
        return this.driver.aggregate(this.resource, args, tx);
    }

    /**
     * @param {import('./../types/shared').RepositoryCountOptions<any>} [options]
     * @param {TransactionClient} [tx]
     * @returns {Promise<number>}
     */
    async count(options = {}, tx = null) {
        return this.driver.count(this.resource, { where: options.where }, tx);
    }

    /**
     * @param {{ where: W, data: U }} options
     * @param {TransactionClient} [tx]
     * @returns {Promise<T>}
     */
    async update(options, tx = null) {
        const { where, data } = /** @type {any} */ (options);

        const model = await this.findUnique({ where }, tx);
        if (model) {
            await this._notify('updating', model, tx);
            await this._notify('saving', model, tx);
        }

        const result = await this.driver.update(this.resource, where, data, tx, this.mutationInclude);
        const updatedModel = /** @type {T} */ (this._hydrate(result));

        await this._notify('updated', updatedModel, tx);
        await this._notify('saved', updatedModel, tx);

        return updatedModel;
    }

    /**
     * @param {{ where: object, data: U }} options
     * @param {TransactionClient} [tx]
     */
    async updateMany(options, tx = null) {
        return this.driver.updateMany(this.resource, options.where, options.data, tx);
    }

    /**
     * @param {{ where: W }} options
     * @param {TransactionClient} [tx]
     * @returns {Promise<T>}
     */
    async delete(options, tx = null) {
        const model = await this.findUnique(/** @type {any} */ (options), tx);
        await this._notify('deleting', model, tx);

        const result = await this.driver.delete(this.resource, options.where, tx);
        const hydrated = /** @type {T} */ (this._hydrate(result));

        await this._notify('deleted', model || hydrated, tx);

        return hydrated;
    }

    /**
     * @param {{ where: object }} options
     * @param {TransactionClient} [tx]
     */
    async deleteMany(options, tx = null) {
        return this.driver.deleteMany(this.resource, options.where, tx);
    }

    /**
     * @param {{ where: W, update: U, create: C }} options
     * @param {TransactionClient} [tx]
     * @returns {Promise<T>}
     */
    async upsert(options, tx = null) {
        const driverOptions = {
            where: /** @type {object} */ (options.where),
            update: /** @type {object} */ (options.update),
            create: /** @type {object} */ (options.create),
        };

        const result = await this.driver.upsert(this.resource, driverOptions, tx);
        const model = /** @type {T} */ (this._hydrate(result));

        await this._notify('saved', model, tx);

        return model;
    }

    /**
     * @template TR
     * @param {(tx: TransactionClient) => Promise<TR>} work
     * @returns {Promise<TR>}
     */
    async runInTransaction(work, options = {}) {
        return this.driver.runInTransaction(work, options);
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
