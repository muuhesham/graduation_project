//@ts-check

import BaseRepository from './BaseRepository.js';
import { Organizer } from './../models/index.js';
import OrganizerVerificationStatus from './../constants/enums/organizerVerificationStatus.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Organizer} OrganizerType
 * @typedef {import('./../types/models').OrganizerCreate} OrganizerCreate
 * @typedef {import('./../types/models').OrganizerUpdate} OrganizerUpdate
 * @typedef {import('./../types/models').OrganizerWhereUnique} OrganizerWhereUnique
 * @typedef {import('./../types/models').OrganizerSelect} OrganizerSelect
 * @typedef {import('./../types/models').OrganizerInclude} OrganizerInclude
 * @typedef {import('./../types/models').Business} BusinessType
 * @typedef {import('./../types/models').Company} CompanyType
 * @typedef {import('./../types/models').Hobbyist} HobbyistType
 * @typedef {import('./../types/shared').RepositoryProjection<OrganizerSelect, OrganizerInclude>} OrganizerProjection
 */

/**
 * @extends {BaseRepository<OrganizerType, OrganizerCreate, OrganizerUpdate, OrganizerWhereUnique, OrganizerSelect, OrganizerInclude, any>}
 */
export default class OrganizerRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Organizer, {
            searchFields: ['name', 'contactEmail', 'contactPhone'],
        });
    }

    /**
     * @param {OrganizerCreate} data
     * @param {import('@prisma/client').Prisma.TransactionClient | null} [tx]
     * @return {Promise<OrganizerType>}
     */
    async create(data, tx = null) {
        return super.create(data, tx);
    }

    /**
     * @param {BusinessType} data
     * @param {import('@prisma/client').Prisma.TransactionClient | null} [tx]
     * @returns {Promise<BusinessType>}
     */
    async createBusiness(data, tx = null) {
        return this.driver.create('business', data, tx);
    }

    /**
     * @param {CompanyType} data
     * @param {import('@prisma/client').Prisma.TransactionClient | null} [tx]
     * @returns {Promise<CompanyType>}
     */
    async createCompany(data, tx = null) {
        return this.driver.create('company', data, tx);
    }

    /**
     * @param {HobbyistType} data
     * @param {import('@prisma/client').Prisma.TransactionClient | null} [tx]
     * @returns {Promise<HobbyistType>}
     */
    async createHobbyist(data, tx = null) {
        return this.driver.create('hobbyist', data, tx);
    }

    /**
     * @param {string} id
     * @param {OrganizerProjection} [projection]
     * @param {import('@prisma/client').Prisma.TransactionClient | null} [tx]
     */
    findById(id, projection = {}, tx = null) {
        return super.findUnique(
            {
                where: { id },
                ...projection,
            },
            tx
        );
    }

    /**
     * @param {string} userId
     * @param {OrganizerProjection} [projection]
     * @param {import('@prisma/client').Prisma.TransactionClient | null} [tx]
     */
    findByUserId(userId, projection = {}, tx = null) {
        return super.findOne(
            {
                where: { userId },
                ...projection,
            },
            tx
        );
    }

    /**
     * @param {OrganizerVerificationStatus} status
     * @param {{ page?: number, limit?: number }} [options]
     */
    findByVerificationStatus(status, options = {}) {
        return super.paginate({
            where: { verificationStatus: status },
            pagination: options,
        });
    }

    /**
     * @param {{ status?: import('@prisma/client').$Enums.OrganizerStatus, verificationStatus?: OrganizerVerificationStatus, page?: number, limit?: number }} [options]
     */
    list(options = {}) {
        const { status, verificationStatus, ...pagination } = options;
        return super.paginate({
            where: {
                ...(status ? { status } : {}),
                ...(verificationStatus ? { verificationStatus } : {}),
            },
            pagination,
        });
    }

    countAllOrganizers() {
        return super.count();
    }

    /**
     * @param {OrganizerVerificationStatus} status
     */
    countByVerificationStatus(status) {
        return super.count({ where: { verificationStatus: status } });
    }
}
