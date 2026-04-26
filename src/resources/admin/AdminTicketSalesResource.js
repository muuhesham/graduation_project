//@ts-check

import BaseResource from './../BaseResource.js';
import TicketTypeResource from './../TicketTypeResource.js';

/**
 * @typedef {import('./../../types/models').TicketType} TicketType
 * @typedef {import('./../../types/models').TicketTypeSalesResourceData} Data
 */

/**
 * @extends {BaseResource<TicketType, Data>}
 */
export default class AdminTicketSalesResource extends BaseResource {
    /**
     * @param {TicketType | any} ticketType
     * @returns {Data}
     */
    static toArray(ticketType) {
        return TicketTypeResource.toArray(ticketType);
    }
}
