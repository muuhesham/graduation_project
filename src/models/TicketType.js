//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').TicketTypeData} TicketTypeDataType */

/**
 * @extends {BaseModel<TicketTypeDataType>}
 */
class TicketType extends BaseModel {
    /**
     * @param {TicketTypeDataType} data
     */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'ticketType';
    }

    static get softDeleteField() {
        return null;
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'eventId', cast: numberCast },
            { field: 'price', cast: numberCast },
            { field: 'quantity', cast: numberCast },
            { field: 'sold', cast: numberCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    /**
     * @returns {number}
     */
    get ticketsSold() {
        const data = /** @type {any} */ (this);
        return Array.isArray(data.orderItems)
            ? data.orderItems.reduce(
                  /** @param {number} sum @param {{ quantity?: number | string | null }} orderItem */
                  (sum, orderItem) => sum + Number(orderItem?.quantity ?? 0),
                  0
              )
            : 0;
    }
}

/** @type {typeof TicketType & (new (data: TicketTypeDataType) => TicketType & TicketTypeDataType)} */
const TicketTypeExport = /** @type {any} */ (TicketType);
export default TicketTypeExport;
