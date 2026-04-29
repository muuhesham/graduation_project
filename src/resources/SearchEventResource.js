//@ts-check

import EventResource from './EventResource.js';

/** @typedef {import('../types/search.types.js').SearchEvent} SearchEvent */
/** @typedef {import('../models/Event.js').default} EventModel */

/**
 * @extends {EventResource}
 */
export default class SearchEventResource extends EventResource {
    /**
     * @param {EventModel | any} event
     * @returns {any}
     */
    static toArray(event) {
        const base = super.toArray(event);

        const ticketTypes = Array.isArray(event.ticketTypes) ? event.ticketTypes : [];
        const prices = ticketTypes.map(t => t.price).filter(p => typeof p === 'number');

        return {
            ...base,
            priceStartsFrom: prices.length ? Math.min(...prices) : null,
            isInterested: Boolean(event.isInterested),
            ...(typeof event.similarity === 'number' && { similarity: event.similarity }),
        };
    }
}
