//@ts-check

import BaseModel from './BaseModel.js';
import fileService from './../services/fileService.js';
import Category from './Category.js';
import Venue from './Venue.js';
import Organizer from './Organizer.js';
import TicketType from './TicketType.js';
import EventSession from './EventSession.js';
import EventTag from './EventTag.js';
import EventRule from './EventRule.js';

import { dateCast, numberCast, stringCast, booleanCast } from './casts.js';

/**
 * @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition
 * @typedef {import('./../types/models').Event} EventModel
 * @typedef {EventModel & {
 *    category?: import('./index').Category;
 *    venue?: import('./index').Venue;
 *    organizer?: import('./index').Organizer;
 *    ticketTypes?: import('./index').TicketType[];
 *    eventSessions?: import('./index').EventSession[];
 *    eventTags?: import('./index').EventTag[];
 *    eventRules?: import('./index').EventRule[];
 *    pendingOrders?: number;
 *    completedOrders?: number;
 *    issuedTickets?: number;
 *    activeSeatReservations?: number;
 * }} FullEventModel
 */

/** @extends {BaseModel<EventModel>} */
class Event extends BaseModel {
    /**
     * @param {EventModel} data
     */
    constructor(data) {
        super(data);
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'organizerId', cast: stringCast },
            { field: 'venueId', cast: numberCast },
            { field: 'categoryId', cast: numberCast },
            { field: 'title', cast: stringCast },
            { field: 'slug', cast: stringCast },
            { field: 'description', cast: stringCast },
            { field: 'bannerDisk', cast: stringCast },
            { field: 'bannerPath', cast: stringCast },
            { field: 'type', cast: stringCast },
            { field: 'mode', cast: stringCast },
            { field: 'status', cast: stringCast },
            { field: 'hasSeatMap', cast: booleanCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
            { field: 'deletedAt', cast: dateCast },
        ];
    }

    static get resourceName() {
        return 'event';
    }

    static get relations() {
        return {
            category: Category,
            venue: Venue,
            organizer: Organizer,
            ticketTypes: [TicketType],
            eventSessions: [EventSession],
            eventTags: [EventTag],
            eventRules: [EventRule],
        };
    }

    /**
     * @param {string} slug
     * @returns {string}
     */
    static getUploadPath(slug) {
        return `events/${slug}`;
    }

    /**
     * @returns {string}
     */
    static get softDeleteField() {
        return 'deletedAt';
    }

    get bannerUrl() {
        const path = this.bannerPath;
        if (!path) return null;

        let normalizedPath = path;
        if (!path.startsWith('/') && !path.startsWith('http')) {
            normalizedPath = `/uploads/${path}`;
        }

        return fileService.getAbsUrl(normalizedPath, this.bannerDisk);
    }

    get tagNames() {
        if (!this.eventTags) return [];
        return this.eventTags.map((et) => et.tag?.name).filter(Boolean);
    }

    get ruleNames() {
        if (!this.eventRules) return [];
        return this.eventRules.map((er) => er.rule).filter(Boolean);
    }

    canBeDeleted() {
        return !this.issuedTickets || this.issuedTickets === 0;
    }

    canBeModified() {
        return this.status !== 'cancelled';
    }

    get totalTicketsSold() {
        if (!this.ticketTypes) return 0;
        return this.ticketTypes.reduce(
            (total, ticketType) => total + Number(ticketType?.sold ?? 0),
            0
        );
    }
}

/** @type {typeof Event & (new (data: any) => FullEventModel)} */
const EventExport = /** @type {any} */ (Event);
export default EventExport;
