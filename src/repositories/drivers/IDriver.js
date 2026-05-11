//@ts-check

/**
 * @typedef {import('./../../types/shared').DriverFindQuery<object, any, any, any>} DriverFindQuery
 * @typedef {import('./../../types/shared').RepositoryFindUniqueOptions<object, any, any, any>} RepositoryFindUniqueOptions
 * @typedef {import('./../../types/shared').RepositoryCountOptions<object>} RepositoryCountOptions
 * @typedef {{ count: number }} BatchResult
 *
 * @interface
 */
export default class IDriver {
    /**
     * @returns {Promise<void>}
     */
    async connect() {
        throw new Error('Not implemented');
    }

    /**
     * @returns {Promise<void>}
     */
    async disconnect() {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {any} data
     * @param {any} [tx]
     * @returns {Promise<any>}
     */
    async create(resource, data, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {any[]} data
     * @param {{ skipDuplicates?: boolean }} [options]
     * @param {any} [tx]
     * @returns {Promise<BatchResult>}
     */
    async createMany(resource, data, options = {}, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {DriverFindQuery} query
     * @param {any} [tx]
     * @returns {Promise<any | null>}
     */
    async findOne(resource, query, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {RepositoryFindUniqueOptions} query
     * @param {any} [tx]
     * @returns {Promise<any | null>}
     */
    async findUnique(resource, query, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {DriverFindQuery} query
     * @param {any} [tx]
     * @returns {Promise<any[]>}
     */
    async findMany(resource, query, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {object} args
     * @param {any} [tx]
     * @returns {Promise<any>}
     */
    async aggregate(resource, args, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {RepositoryCountOptions} [query]
     * @param {any} [tx]
     * @returns {Promise<number>}
     */
    async count(resource, query = {}, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {object} where
     * @param {any} data
     * @param {any} [tx]
     * @returns {Promise<any>}
     */
    async update(resource, where, data, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {object} where
     * @param {any} data
     * @param {any} [tx]
     * @returns {Promise<BatchResult>}
     */
    async updateMany(resource, where, data, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {object} where
     * @param {any} [tx]
     * @returns {Promise<any>}
     */
    async delete(resource, where, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {object} where
     * @param {any} [tx]
     * @returns {Promise<BatchResult>}
     */
    async deleteMany(resource, where, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} resource
     * @param {{ where: object, update: object, create: object }} options
     * @param {any} [tx]
     * @returns {Promise<any>}
     */
    async upsert(resource, options, tx) {
        throw new Error('Not implemented');
    }

    /**
     * @param {function(any): Promise<any>} work
     * @returns {Promise<any>}
     */
    async runInTransaction(work) {
        throw new Error('Not implemented');
    }

    /**
     * @param {string} sql
     * @param {any[]} [params]
     * @returns {Promise<any[]> | undefined}
     */
    rawQuery(sql, params) {
        return undefined;
    }
}
