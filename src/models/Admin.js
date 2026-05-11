//@ts-check

import BaseModel from './BaseModel.js';
import { AdminRefreshToken, Organizer, Payout } from './index.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').AdminData} AdminDataType */

/** @extends {BaseModel<AdminDataType>} */
class Admin extends BaseModel {
    /** @param {AdminDataType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'admin';
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            refreshTokens: [AdminRefreshToken],
            reviewedOrganizers: [Organizer],
            payouts: [Payout],
        };
    }

    /**
     * @returns {null}
     */
    static get softDeleteField() {
        return null;
    }
}

/** @type {typeof Admin & (new (data: AdminDataType) => Admin & AdminDataType)} */
const AdminExport = /** @type {any} */ (Admin);
export default AdminExport;
