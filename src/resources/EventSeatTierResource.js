//@ts-check

import BaseResource from './BaseResource.js';

/** @typedef {import('../models/EventSeatTier').default} EventSeatTierModel */

/**
 * @extends {BaseResource}
 */
export default class EventSeatTierResource extends BaseResource {
    /**
     * @param {EventSeatTierModel | any} tier
     * @returns {any}
     */
    static toArray(tier) {
        return {
            id: tier.id,
            eventId: tier.eventId,
            tierNumber: tier.tierNumber,
            name: tier.name,
            price: tier.price,
            color: tier.color,
            numberOfRows: tier.numberOfRows,
            numberOfColumns: tier.numberOfColumns,
        };
    }
}
