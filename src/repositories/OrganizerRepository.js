//@ts-check

import BaseRepository from './BaseRepository.js';

import { Organizer } from './../models/index.js';

import OrganizerVerificationStatus from './../constants/enums/organizerVerificationStatus.js';

/**
 * @typedef {import('./drivers/IDriver.js').default} IDriver
 * @typedef {import('./../types/models/index.js').Organizer} OrganizerType
 * @typedef {import('./../types/models/index.js').OrganizerCreate} OrganizerCreate
 * @typedef {import('./../types/models/index.js').OrganizerUpdate} OrganizerUpdate
 * @typedef {import('./../types/models/index.js').OrganizerWhereUnique} OrganizerWhereUnique
 * @typedef {import('./../types/models/index.js').OrganizerSelect} OrganizerSelect
 * @typedef {import('./../types/models/index.js').OrganizerInclude} OrganizerInclude
 */

/**
 * @extends {BaseRepository<OrganizerType, OrganizerCreate, OrganizerUpdate, OrganizerWhereUnique, OrganizerSelect, OrganizerInclude, any>}
 */
export default class OrganizerRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Organizer);
    }

    /**
     * @param {string} organizerId
     * @param {import('./../types/shared/common.types.js').RepositoryProjection<OrganizerSelect, OrganizerInclude>} [projection]
     */
    findById(organizerId, projection = {}) {
        return super.findUnique({
            where: { id: organizerId },
            ...projection,
        });
    }

    /**
     * @param {OrganizerVerificationStatus} status
     * @param {{ page?: number, limit?: number }} [options]
     */
    findByVerificationStatus(status, options = {}) {
        return super.paginate({
            where: { verificationStatus: status },
            pagination: {
                page: options.page,
                limit: options.limit,
            },
        });
    }

    /**
     * @param {{ status?: import('@prisma/client').$Enums.OrganizerStatus, verificationStatus?: OrganizerVerificationStatus, page?: number, limit?: number }} [options]
     */
    list(options = {}) {
        return super.paginate({
            where: {
                ...(options.status ? { status: options.status } : {}),
                ...(options.verificationStatus
                    ? { verificationStatus: options.verificationStatus }
                    : {}),
            },
            pagination: {
                page: options.page,
                limit: options.limit,
            },
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
