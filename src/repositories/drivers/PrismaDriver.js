//@ts-check

import IDriver from './IDriver.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 * @typedef {keyof import('@prisma/client').Prisma.TypeMap['model']} ModelName
 * @typedef {Uncapitalize<ModelName>} ResourceName
 * @typedef {import('./../../types/shared').DriverFindQuery<object, any, any, any>} DriverFindQuery
 * @typedef {import('./../../types/shared').RepositoryFindUniqueOptions<object, any, any, any>} RepositoryFindUniqueOptions
 * @typedef {import('./../../types/shared').RepositoryCountOptions<object>} RepositoryCountOptions
 * @typedef {Record<string, unknown>} DriverRecord
 * @typedef {{ skipDuplicates?: boolean }} CreateManyOptions
 * @typedef {{ count: number }} AffectedRows
 * @typedef {Array<unknown>} RawQueryParams
 *
 * @callback TransactionWork
 * @param {TransactionClient} tx
 * @returns {Promise<unknown>}
 */

/**
 * @implements {IDriver}
 */
export default class PrismaDriver extends IDriver {
    /**
     * @param {PrismaClient} prismaInstance
     */
    constructor(prismaInstance) {
        super();
        /** @type {PrismaClient} */
        this.client = prismaInstance;
    }

    async connect() {
        await this.client.$connect();
    }

    async disconnect() {
        await this.client.$disconnect();
    }

    /**
     * @private
     * @param {PrismaClient | TransactionClient} db
     * @param {ResourceName} resource
     * @returns {any}
     */
    _model(db, resource) {
        return /** @type {any} */ (db[resource]);
    }

    /**
     * @private
     * @param {DriverFindQuery} query
     */
    _toFindArgs(query = {}) {
        /** @type {any} */
        const args = {};

        if (query.where) {
            args.where = query.where;
        }

        if (query.select) {
            args.select = query.select;
        }

        if (query.include) {
            args.include = query.include;
        }

        if (query.omit) {
            args.omit = query.omit;
        }

        if (query.orderBy) {
            args.orderBy = query.orderBy;
        } else if (query.sort?.field) {
            args.orderBy = {
                [query.sort.field]: query.sort.order || 'desc',
            };
        }

        if (query.skip !== undefined) {
            args.skip = query.skip;
        }

        if (query.take !== undefined) {
            args.take = query.take;
        }

        if (
            args.skip === undefined &&
            typeof query.pagination?.page === 'number' &&
            typeof query.pagination?.limit === 'number'
        ) {
            args.skip = (query.pagination.page - 1) * query.pagination.limit;
            args.take = query.pagination.limit;
        }

        return args;
    }

    /**
     * @param {ResourceName} resource
     * @param {DriverRecord} data
     * @param {PrismaClient | TransactionClient | null} [tx]
     * @param {any} [include]
     */
    async create(resource, data, tx = this.client, include = null) {
        const db = tx || this.client;
        const args = { data };
        if (include) {
            args.include = include;
        }
        return this._model(db, resource).create(args);
    }

    /**
     * @param {ResourceName} resource
     * @param {DriverRecord} data
     * @param {CreateManyOptions} [options]
     * @param {PrismaClient | TransactionClient | null} [tx]
     * @returns {Promise<AffectedRows>}
     */
    async createMany(resource, data, options = {}, tx = null) {
        const db = tx || this.client;
        const result = await this._model(db, resource).createMany({
            data,
            skipDuplicates: options.skipDuplicates,
        });

        return { count: result.count };
    }

    /**
     * @param {ResourceName} resource
     * @param {DriverFindQuery} query
     * @param {PrismaClient | TransactionClient | null} [tx]
     */
    async findOne(resource, query, tx = null) {
        const db = tx || this.client;
        return this._model(db, resource).findFirst(this._toFindArgs(query));
    }

    /**
     * @param {ResourceName} resource
     * @param {RepositoryFindUniqueOptions} query
     * @param {PrismaClient | TransactionClient | null} [tx]
     */
    async findUnique(resource, query, tx = null) {
        const db = tx || this.client;
        // Reverting to findFirst to keep compatibility with the legacy soft-delete middleware
        return this._model(db, resource).findFirst(this._toFindArgs(query));
    }

    /**
     * @param {ResourceName} resource
     * @param {DriverFindQuery} query
     * @param {PrismaClient | TransactionClient | null} [tx]
     */
    async findMany(resource, query, tx = null) {
        const db = tx || this.client;
        const args = this._toFindArgs(query);
        return this._model(db, resource).findMany(args);
    }

    /**
     * @param {ResourceName} resource
     * @param {Record<string, any>} args
     * @param {PrismaClient | TransactionClient | null} [tx]
     */
    async aggregate(resource, args, tx = null) {
        const db = tx || this.client;
        return this._model(db, resource).aggregate(args);
    }

    /**
     * @param {ResourceName} resource
     * @param {RepositoryCountOptions} [query]
     * @param {PrismaClient | TransactionClient | null} [tx]
     */
    async count(resource, query = {}, tx = null) {
        const db = tx || this.client;
        const where = query.where || {};
        return this._model(db, resource).count({ where });
    }

    /**
     * @param {ResourceName} resource
     * @param {DriverRecord} where
     * @param {DriverRecord} data
     * @param {PrismaClient | TransactionClient | null} [tx]
     * @param {any} [include]
     * @returns {Promise<any>}
     */
    async update(resource, where, data, tx = null, include = null) {
        const db = tx || this.client;
        const args = { where, data };
        if (include) {
            args.include = include;
        }
        return this._model(db, resource).update(args);
    }

    /**
     * @param {ResourceName} resource
     * @param {DriverRecord} where
     * @param {DriverRecord} data
     * @param {PrismaClient | TransactionClient | null} [tx]
     * @returns {Promise<AffectedRows>}
     */
    async updateMany(resource, where, data, tx = null) {
        const db = tx || this.client;
        const result = await this._model(db, resource).updateMany({ where, data });
        return { count: result.count };
    }

    /**
     * @param {ResourceName} resource
     * @param {DriverRecord} where
     * @param {PrismaClient | TransactionClient | null} [tx]
     */
    async delete(resource, where, tx = null) {
        const db = tx || this.client;
        return this._model(db, resource).delete({ where });
    }

    /**
     * @param {ResourceName} resource
     * @param {DriverRecord} where
     * @param {PrismaClient | TransactionClient | null} [tx]
     * @returns {Promise<AffectedRows>}
     */
    async deleteMany(resource, where, tx = null) {
        const db = tx || this.client;
        const result = await this._model(db, resource).deleteMany({ where });
        return { count: result.count };
    }

    /**
     * @param {ResourceName} resource
     * @param {{ where: DriverRecord, update: DriverRecord, create: DriverRecord }} options
     * @param {PrismaClient | TransactionClient | null} [tx]
     */
    async upsert(resource, options, tx = null) {
        const db = tx || this.client;
        return this._model(db, resource).upsert({
            where: options.where,
            update: options.update,
            create: options.create,
        });
    }

    /**
     * @template T
     * @param {(tx: TransactionClient) => Promise<T>} work
     * @returns {Promise<T>}
     */
    async runInTransaction(work, options = {}) {
        return this.client.$transaction(async (tx) => work(tx), options);
    }

    /**
     * @param {string} sql
     * @param {RawQueryParams} [params]
     */
    async rawQuery(sql, params = []) {
        return /** @type {Promise<any[]>} */ (this.client.$queryRawUnsafe(sql, ...params));
    }
}
