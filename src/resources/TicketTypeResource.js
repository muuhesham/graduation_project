//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').TicketType} TicketType
 * @typedef {import('./../types/models').TicketTypeSalesResourceData} TicketTypeSalesResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class TicketTypeResource extends BaseResource {
    /**
     * @param {TicketType | any} ticketType
     * @returns {TicketTypeSalesResourceData | null}
     */
    static make(ticketType) {
        return super.make(ticketType);
    }

    /**
     * @param {TicketType | any} ticketType
     * @returns {TicketTypeSalesResourceData}
     */
    static toArray(ticketType) {
        return {
            ticketTypeId: Number(ticketType.id ?? 0),
            name: ticketType.name ?? null,
            price: Number(ticketType.price ?? 0),
            ticketsSold: Number(ticketType.ticketsSold ?? 0),
        };
    }
}
