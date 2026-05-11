//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast, stringCast } from './casts.js';
import User from './User.js';
import TicketType from './TicketType.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Seat from './Seat.js';
import QrCode from './QrCode.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').TicketData} TicketData */

/**
 * @extends {BaseModel<TicketData>}
 **/
class Ticket extends BaseModel {
    /** @param {TicketData} data */
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
            { field: 'ticketTypeId', cast: numberCast },
            { field: 'eventSeatId', cast: numberCast },
            { field: 'orderId', cast: stringCast },
            { field: 'orderItemId', cast: stringCast },
            { field: 'status', cast: stringCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            user: User,
            ticketType: TicketType,
            order: Order,
            orderItem: OrderItem,
            eventSeat: Seat,
            qrCode: QrCode,
        };
    }

    static get resourceName() {
        return 'ticket';
    }
}

/** @type {typeof Ticket & (new (data: TicketData) => Ticket & TicketData)} */
const TicketExport = /** @type {any} */ (Ticket);
export default TicketExport;
