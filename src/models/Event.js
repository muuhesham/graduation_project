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
import { booleanCast, dateCast, numberCast, stringCast } from './casts.js';
import OrderStatus from '../constants/enums/orderStatus.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/**
 * @typedef {import('./../types/models').EventData} EventDataType
 * @typedef {import('./../types/models').Event} FullEventModel
 * @typedef {EventDataType & {
 *     pendingOrders?: number;
 *     completedOrders?: number;
 *     issuedTickets?: number;
 *     activeSeatReservations?: number;
 * }} EventDeletionState
 */

/**
 * @extends {BaseModel<EventDeletionState>}
 **/
class Event extends BaseModel {
    /** @param {EventDeletionState} data */
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
            { field: 'slug', cast: stringCast },
            { field: 'title', cast: stringCast },
            { field: 'description', cast: stringCast },
            { field: 'bannerDisk', cast: stringCast },
            { field: 'bannerPath', cast: stringCast },
            { field: 'type', cast: stringCast },
            { field: 'mode', cast: stringCast },
            { field: 'hasSeatMap', cast: booleanCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
            { field: 'deletedAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
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

    get bannerUrl() {
        const eventData = /** @type {any} */ (this);
        return eventData.bannerPath
            ? fileService.getAbsUrl(eventData.bannerPath, eventData.bannerDisk)
            : null;
    }

    get tagNames() {
        const eventData = /** @type {any} */ (this);
        if (!Array.isArray(eventData.eventTags)) return [];

        return eventData.eventTags
            .map((et) => et?.tag?.name ?? null)
            .filter((name) => typeof name === 'string');
    }

    get ruleNames() {
        const eventData = /** @type {any} */ (this);
        if (!Array.isArray(eventData.eventRules)) return [];

        return eventData.eventRules
            .map((rule) => rule?.rule ?? null)
            .filter((value) => typeof value === 'string');
    }

    static get resourceName() {
        return 'event';
    }

    /**
     * @param {string} [slug]
     * @returns {string}
     */
    static getUploadPath(slug) {
        return slug ? `events/${slug}` : 'events';
    }

    /**
     * @returns {string}
     */
    static get softDeleteField() {
        return 'deletedAt';
    }

    /** @this {EventDeletionState & Event} */
    canBeDeleted() {
        const pendingOrders =
            typeof this.pendingOrders === 'number'
                ? this.pendingOrders
                : this.#countDistinctOrdersByStatus(OrderStatus.PENDING);
        const completedOrders =
            typeof this.completedOrders === 'number'
                ? this.completedOrders
                : this.#countDistinctOrdersByStatus(OrderStatus.COMPLETED);
        const issuedTickets =
            typeof this.issuedTickets === 'number'
                ? this.issuedTickets
                : this.#countIssuedTickets();
        const activeSeatReservations =
            typeof this.activeSeatReservations === 'number' ? this.activeSeatReservations : 0;

        return (
            !this.deletedAt &&
            pendingOrders === 0 &&
            completedOrders === 0 &&
            issuedTickets === 0 &&
            activeSeatReservations === 0
        );
    }

    /** @this {EventDeletionState & Event} */
    canBeModified() {
        return this.canBeDeleted();
    }

    canBeCancelled() {
        const pendingOrders =
            typeof this.pendingOrders === 'number'
                ? this.pendingOrders
                : this.#countDistinctOrdersByStatus(OrderStatus.PENDING);
        const completedOrders =
            typeof this.completedOrders === 'number'
                ? this.completedOrders
                : this.#countDistinctOrdersByStatus(OrderStatus.COMPLETED);

        return !this.deletedAt && pendingOrders === 0 && completedOrders === 0;
    }

    /**
     * @param {import('@prisma/client').OrderStatus} status
     * @returns {number}
     */
    #countDistinctOrdersByStatus(status) {
        const eventData = /** @type {any} */ (this);
        const ticketTypes = Array.isArray(eventData.ticketTypes) ? eventData.ticketTypes : [];
        const orderIds = new Set();

        for (const ticketType of ticketTypes) {
            const orderItems = Array.isArray(ticketType?.orderItems) ? ticketType.orderItems : [];

            for (const orderItem of orderItems) {
                const order = orderItem?.order;

                if (!order?.id || order.status !== status) continue;
                orderIds.add(order.id);
            }
        }

        return orderIds.size;
    }

    /**
     * @returns {number}
     */
    #countIssuedTickets() {
        const eventData = /** @type {any} */ (this);
        const ticketTypes = Array.isArray(eventData.ticketTypes) ? eventData.ticketTypes : [];

        return ticketTypes.reduce(
            /**
             * @param {number} total
             * @param {any} ticketType
             */
            (total, ticketType) => total + Number(ticketType?.sold ?? 0),
            0
        );
    }
}

/** @type {typeof Event & (new (data: any) => FullEventModel)} */
const EventExport = /** @type {any} */ (Event);
export default EventExport;
