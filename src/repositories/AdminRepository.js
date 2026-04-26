//@ts-check

import BaseRepository from './BaseRepository.js';

import { Admin } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver.js').default} IDriver
 * @typedef {import('./../types/models/admin.model.js').AdminHydrated} AdminType
  * @typedef {import('./../types/models/admin.model.js').AdminRefreshTokenRecord} AdminRefreshTokenRecord
  * @typedef {import('./../types/models/admin.model.js').AdminCreate} AdminCreate
  * @typedef {import('./../types/models/admin.model.js').AdminUpdate} AdminUpdate
  * @typedef {import('./../types/models/admin.model.js').AdminWhereUnique} AdminWhereUnique
  * @typedef {import('./../types/models/admin.model.js').AdminSelect} AdminSelect
  * @typedef {import('./../types/models/admin.model.js').AdminInclude} AdminInclude
  * @typedef {import('./../types/models/admin.model.js').AdminProjection} AdminProjection
  */

 /**
  * @extends {BaseRepository<AdminType, AdminCreate, AdminUpdate, AdminWhereUnique, AdminSelect, AdminInclude, any>}
  */
 export default class AdminRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Admin);
    }

    /**
     * @param {AdminCreate} data
     */
    create(data) {
        return super.create(data);
    }

    /**
     * @param {number} adminId
     * @param {string} token
     * @returns {Promise<AdminRefreshTokenRecord>}
     */
    createRefreshToken(adminId, token) {
        return /** @type {Promise<AdminRefreshTokenRecord>} */ (
            this.driver.create('adminRefreshToken', {
                adminId,
                token,
            })
        );
    }

    /**
     * @param {string} token
     * @returns {Promise<AdminRefreshTokenRecord | null>}
     */
    findRefreshToken(token) {
        return /** @type {Promise<AdminRefreshTokenRecord | null>} */ (
            this.driver.findOne('adminRefreshToken', {
                where: { token },
                include: { admin: true },
            })
        );
    }

    /**
     * @param {number} tokenId
     */
    deleteRefreshToken(tokenId) {
        return this.driver.delete('adminRefreshToken', { id: tokenId });
    }

    /**
     * @param {number} id
     * @param {AdminProjection} [projection]
     */
    findById(id, projection = {}) {
        return super.findUnique({
            where: { id },
            ...projection,
        });
    }

    /**
     * @param {string} email
     * @param {AdminProjection} [projection]
     */
    findByEmail(email, projection = {}) {
        return super.findUnique({
            where: { email },
            ...projection,
        });
    }
}
