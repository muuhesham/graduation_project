//@ts-check

import BaseResource from './BaseResource.js';
import { makePagination } from './helpers/pagination.js';
import TagResource from './TagResource.js';
import VenueResource from './VenueResource.js';
import CategoryResource from './CategoryResource.js';

/**
 * @typedef {import('./../types/models').Event} Event
 * @typedef {import('./../types/models').EventResourceData} EventResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class EventResource extends BaseResource {
    /**
     * @param {Event | any} event
     * @returns {EventResourceData | null}
     */
    static make(event) {
        return super.make(event);
    }

    /**
     * @param {Event | any} event
     * @returns {EventResourceData}
     */
    static toArray(event) {
        return {
            id: event.id ?? null,
            organizerId: event.organizerId ?? null,
            venueId: event.venueId ?? null,
            categoryId: event.categoryId ?? null,
            title: event.title ?? null,
            slug: event.slug ?? null,
            description: event.description ?? null,
            bannerUrl: event.bannerUrl ?? null,
            type: event.type ?? null,
            mode: event.mode ?? null,
            category: CategoryResource.make(event.category),
            venue: VenueResource.make(event.venue),
            tags: event.tagNames ?? [],
            hasSeatMap: event.hasSeatMap ?? false,
            deletedAt: event.deletedAt ?? null,
            createdAt: event.createdAt ?? null,
            updatedAt: event.updatedAt ?? null,
            
            // Inclusion of extra fields if present (e.g. from deletion state)
            ...(event.pendingOrders !== undefined && { pendingOrders: event.pendingOrders }),
            ...(event.completedOrders !== undefined && { completedOrders: event.completedOrders }),
            ...(event.issuedTickets !== undefined && { issuedTickets: event.issuedTickets }),
            ...(event.activeSeatReservations !== undefined && { activeSeatReservations: event.activeSeatReservations }),
            ...(event.canBeDeleted !== undefined && { canBeDeleted: event.canBeDeleted() }),
            ...(event.canBeModified !== undefined && { canBeModified: event.canBeModified() }),
        };
    }

    /**
     * @param {Event[]} items
     * @returns {EventResourceData[]}
     */
    static collection(items) {
        return super.collection(items);
    }

    /**
     * @param {any} result
     * @param {string} [dataKey]
     * @returns {any}
     */
    static paginate(result, dataKey = 'events') {
        return super.paginate(result, dataKey);
    }
}
