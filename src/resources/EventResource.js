//@ts-check

import BaseResource from './BaseResource.js';
import CategoryResource from './CategoryResource.js';
import VenueResource from './VenueResource.js';

/** @typedef {import('../models/Event').default} EventModel */

/**
 * @extends {BaseResource}
 */
export default class EventResource extends BaseResource {
    /**
     * @param {EventModel | any} event
     * @returns {any}
     */
    static toArray(event) {
        return {
            id: event.id,
            organizerId: event.organizerId,
            venueId: event.venueId,
            categoryId: event.categoryId,
            title: event.title,
            slug: event.slug,
            description: event.description,
            bannerUrl: event.bannerUrl,
            type: event.type,
            mode: event.mode,
            category: CategoryResource.make(event.category),
            venue: VenueResource.make(event.venue),
            tags: event.tagNames,
            rules: event.ruleNames,
            hasSeatMap: event.hasSeatMap,
            deletedAt: event.deletedAt,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            
            ...(event.pendingOrders !== undefined && { pendingOrders: event.pendingOrders }),
            ...(event.completedOrders !== undefined && { completedOrders: event.completedOrders }),
            ...(event.issuedTickets !== undefined && { issuedTickets: event.issuedTickets }),
            ...(event.activeSeatReservations !== undefined && { activeSeatReservations: event.activeSeatReservations }),
            ...(typeof event.canBeDeleted === 'function' && { canBeDeleted: event.canBeDeleted() }),
            ...(typeof event.canBeModified === 'function' && { canBeModified: event.canBeModified() }),
        };
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
