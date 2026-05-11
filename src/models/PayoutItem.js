//@ts-check

import BaseModel from './BaseModel.js';
import { numberCast, stringCast } from './casts.js';
import { Payout, Organizer } from './index.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('@prisma/client').PayoutItem} PayoutItemType */

/** @extends {BaseModel<PayoutItemType>} */
class PayoutItem extends BaseModel {
    /** @param {PayoutItemType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'payoutItem';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'payoutId', cast: numberCast },
            { field: 'organizerId', cast: stringCast },
            { field: 'amount', cast: numberCast },
            { field: 'status', cast: stringCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            payout: Payout,
            organizer: Organizer,
        };
    }
}

/** @type {typeof PayoutItem & (new (data: PayoutItemType) => PayoutItem & PayoutItemType)} */
const PayoutItemExport = /** @type {any} */ (PayoutItem);
export default PayoutItemExport;
