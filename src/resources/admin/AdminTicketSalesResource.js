//@ts-check

import BaseResource from './../BaseResource.js';
import TicketTypeResource from './../TicketTypeResource.js';

/**
 * @typedef {import('./../../types/models').TicketType} TicketType
 * @typedef {import('./../../types/models').TicketTypeSalesResourceData} Data
 */

/**
 * @extends {BaseResource}
 */
export default class AdminTicketSalesResource extends BaseResource {
    /**
     * @param {TicketType | any} ticketType
     * @returns {Data | null}
     */
    static make(ticketType) {
        return super.make(ticketType);
    }

    /**
     * @param {TicketType | any} ticketType
     * @returns {Data}
     */
    static toArray(ticketType) {
        return TicketTypeResource.toArray(ticketType);
    }

    /**
     * @param {TicketType[]} items
     * @returns {Data[]}
     */
    static collection(items) {
        return super.collection(items);
    }

    /**
     * @param {any} result
     * @param {string} [dataKey]
     * @returns {any}
     */
    static paginate(result, dataKey = 'ticketSales') {
        return super.paginate(result, dataKey);
    }
}
