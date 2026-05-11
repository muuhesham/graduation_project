//@ts-check

import BaseRepository from './BaseRepository.js';
import { Venue } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Venue} VenueType
 * @typedef {import('./../types/models').VenueCreate} VenueCreate
 * @typedef {import('./../types/models').VenueUpdate} VenueUpdate
 * @typedef {import('./../types/models').VenueWhereUnique} VenueWhereUnique
 * @typedef {import('./../types/models').VenueSelect} VenueSelect
 * @typedef {import('./../types/models').VenueInclude} VenueInclude
 * @typedef {import('./../types/models').VenueProjection} VenueProjection
 */

/**
 * @extends {BaseRepository<VenueType, VenueCreate, VenueUpdate, VenueWhereUnique, VenueSelect, VenueInclude, any>}
 */
export default class VenueRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Venue);
    }

    /**
     * @param {number} id
     * @param {VenueProjection} [projection]
     * @returns {Promise<VenueType | null>}
     */
    findById(id, projection = {}) {
        return this.findUnique({
            ...projection,
            where: { id },
        });
    }
}
