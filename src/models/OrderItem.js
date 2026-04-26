//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast } from './casts.js';
import TicketType from './TicketType.js';

/** @typedef {import('./contracts/ICastableModel.js').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models/order.model.js').OrderItemData} OrderItemDataType */

/** 
 * @extends {BaseModel<OrderItemDataType>} 
 */
class OrderItem extends BaseModel {
    /** @param {OrderItemDataType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'orderItem';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'price', cast: numberCast },
            { field: 'quantity', cast: numberCast },
            { field: 'createdAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            ticketType: TicketType,
        };
    }
}

/** @type {typeof OrderItem & (new (data: OrderItemDataType) => OrderItem & OrderItemDataType)} */
const OrderItemExport = /** @type {any} */ (OrderItem);
export default OrderItemExport;
