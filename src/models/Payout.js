//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast } from './casts.js';
import Admin from './Admin.js';
import Order from './Order.js';
import PayoutItem from './PayoutItem.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').PayoutData} PayoutDataType */

/** 
 * @extends {BaseModel<PayoutDataType>} 
 */
class Payout extends BaseModel {
    /** @param {PayoutDataType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'payout';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'adminId', cast: numberCast },
            { field: 'amount', cast: numberCast },
            { field: 'organizerCount', cast: numberCast },
            { field: 'orderCount', cast: numberCast },
            { field: 'startDate', cast: dateCast },
            { field: 'endDate', cast: dateCast },
            { field: 'createdAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            admin: Admin,
            orders: [Order],
            items: [PayoutItem],
        };
    }
}

/** @type {typeof Payout & (new (data: PayoutDataType) => Payout & PayoutDataType)} */
const PayoutExport = /** @type {any} */ (Payout);
export default PayoutExport;
