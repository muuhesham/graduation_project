//@ts-check

import BaseRepository from './BaseRepository.js';

import { User } from './../models/index.js';

import OrderStatus from './../constants/enums/orderStatus.js';

/**
 * @typedef {import('./drivers/IDriver.js').default} IDriver
 * @typedef {import('./../types/models').User} UserType
 * @typedef {import('./../types/models').UserCreate} UserCreate
 * @typedef {import('./../types/models').UserUpdate} UserUpdate
 * @typedef {import('./../types/models').UserWhereUnique} UserWhereUnique
 * @typedef {import('./../types/models').UserWhere} UserWhere
 * @typedef {import('./../types/models').UserSelect} UserSelect
 * @typedef {import('./../types/models').UserInclude} UserInclude
 * @typedef {import('./../types/models').UserProjection} UserProjection
 */

/**
 * @extends {BaseRepository<UserType, UserCreate, UserUpdate, UserWhereUnique, UserSelect, UserInclude, any>}
 */
export default class UserRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, User);
    }

    /**
     * @param {string} id
     * @param {UserProjection} [projection]
     * @returns {Promise<UserType | null>}
     */
    findById(id, projection = {}) {
        return super.findUnique({
            where: { id },
            ...projection,
        });
    }

    /**
     * @param {import('./../types/models/user.model.js').UserReadOptions & UserWhere} [query]
     */
    getAllUsers(query = {}) {
        const where = this._implicitWhere(query);

        return super.paginate({
            ...query,
            where: { deletedAt: null, ...(where || {}) },
        });
    }

    /**
     * @param {number} days
     */
    countActiveUsers(days = 30) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        return super.count({
            where: {
                orders: {
                    some: {
                        status: OrderStatus.COMPLETED,
                        createdAt: { gte: since },
                    },
                },
            },
        });
    }

    countAllUsers() {
        return super.count({ where: { deletedAt: null } });
    }

    countDeletedUsers() {
        return super.count({ where: { deletedAt: { not: null } } });
    }

    /**
     * @param {string} role
     */
    countByRole(role) {
        return super.count({ where: { role } });
    }

    /**
     * @param {string} userId
     */
    async restoreDeleted(userId) {
        return super.update({
            where: { id: userId },
            data: { deletedAt: null },
        });
    }

    /**
     * @param {UserCreate[]} users
     * @param {import('./../types/shared/common.types.js').BulkInsertOptions} [options]
     */
    bulkInsertUsers(users, options) {
        return super.bulkInsert({
            data: users,
            ...options,
        });
    }
}
