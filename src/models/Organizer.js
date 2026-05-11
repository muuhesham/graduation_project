//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast, stringCast } from './casts.js';
import { Event, User, Venue, City, State, Country, Hobbyist, Business, Company } from './index.js';
import fileService from './../services/fileService.js';

/**
 * @typedef {import('./../types/models').Organizer} OrgainzerType
 * @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition
 * @typedef {OrgainzerType & {
 *     user?: import('./index').User;
 *     venue?: import('./index').Venue;
 *     city?: import('./index').City;
 *     state?: import('./index').State;
 *     country?: import('./index').Country;
 *     Event?: import('./index').Event[];
 * }} OrganizerDataType
 * @typedef {OrganizerDataType & {
 *     deletedAt: Date | null;
 * }} OrganizerDeletionState
 *
 * @typedef {import('./index').Hobbyist} Hobbyist
 * @typedef {import('./index').Business} Business
 * @typedef {import('./index').Company} Company
 */

/** @extends {BaseModel<OrgainzerType>} */
class Organizer extends BaseModel {
    /**
     * @param {OrgainzerType} data
     */
    constructor(data) {
        super(data);
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: stringCast },
            { field: 'userId', cast: stringCast },
            { field: 'name', cast: stringCast },
            { field: 'type', cast: stringCast },
            { field: 'contactEmail', cast: stringCast },
            { field: 'contactPhone', cast: stringCast },
            { field: 'status', cast: stringCast },
            { field: 'verificationStatus', cast: stringCast },
            { field: 'reviewedBy', cast: numberCast },
            { field: 'reviewedAt', cast: dateCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    static get resourceName() {
        return 'organizer';
    }

    /**
     * @param {string} userId
     * @param {'logos' | 'covers'} [type]
     * @returns {string}
     */
    static getUploadPath(userId, type = 'logos') {
        return `user/${userId}/organizer/${type}`;
    }

    static get relations() {
        return {
            user: User,
            city: City,
            state: State,
            country: Country,
            Event: [Event],
            hobbyist: Hobbyist,
            business: Business,
            company: Company,
        };
    }

    /**
     * @returns {string}
     */
    static get softDeleteField() {
        return 'deletedAt';
    }

    /**
     * @returns {Hobbyist | Business | Company | null}
     */
    get subtype() {
        return this.hobbyist || this.business || this.company || null;
    }

    get logoUrl() {
        const path = this.logoPath;
        if (!path) return null;
        
        const normalizedPath = (!path.startsWith('/') && !path.startsWith('http')) 
            ? `/uploads/${path}` 
            : path;
            
        return fileService.getAbsUrl(normalizedPath, this.logoDisk);
    }

    get coverUrl() {
        const path = this.coverPath;
        if (!path) return null;
        
        const normalizedPath = (!path.startsWith('/') && !path.startsWith('http')) 
            ? `/uploads/${path}` 
            : path;
            
        return fileService.getAbsUrl(normalizedPath, this.coverDisk);
    }

    /**
     * @returns {boolean | undefined}
     */
    get isFollowing() {
        // @ts-ignore
        return this._isFollowing;
    }

    /**
     * @param {boolean | undefined} value
     */
    set isFollowing(value) {
        // @ts-ignore
        this._isFollowing = value;
    }
}

/** @type {typeof Organizer & (new (data: OrganizerDataType) => Organizer & OrganizerDataType)} */
const OrganizerExport = /** @type {any} */ (Organizer);
export default OrganizerExport;
