//@ts-check

import BaseRepository from './BaseRepository.js';
import { OrganizerFollower as OrganizerFollowerModel } from '../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/shared').RepositoryModelClass<OrganizerFollower>} OrganizerFollowerClass
 * @typedef {import('./../types/models/organizerFollower.model').OrganizerFollower} OrganizerFollower
 * @typedef {import('./../types/models/organizerFollower.model').OrganizerFollowerCreate} OrganizerFollowerCreate
 * @typedef {import('./../types/models/organizerFollower.model').OrganizerFollowerUpdate} OrganizerFollowerUpdate
 * @typedef {import('./../types/models/organizerFollower.model').OrganizerFollowerWhere} OrganizerFollowerWhere
 * @typedef {import('./../types/models/organizerFollower.model').OrganizerFollowerSelect} OrganizerFollowerSelect
 * @typedef {import('./../types/models/organizerFollower.model').OrganizerFollowerInclude} OrganizerFollowerInclude
 */

/**
 * @extends {BaseRepository<OrganizerFollower, OrganizerFollowerCreate, OrganizerFollowerUpdate, OrganizerFollowerWhere, OrganizerFollowerSelect, OrganizerFollowerInclude>}
 */
class OrganizerFollowerRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, OrganizerFollowerModel);
    }

    /**
     * @param {string} userId
     * @param {string} organizerId
     * @returns {Promise<boolean>}
     */
    async isFollowing(userId, organizerId) {
        const count = await this.count({
            where: {
                userId,
                organizerId,
            },
        });
        return count > 0;
    }

    /**
     * @param {string} organizerId
     * @returns {Promise<number>}
     */
    async getFollowerCount(organizerId) {
        return this.count({
            where: {
                organizerId,
            },
        });
    }
}

export default OrganizerFollowerRepository;
