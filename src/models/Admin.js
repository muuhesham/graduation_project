//@ts-check

import BaseModel from './BaseModel.js';

/** @typedef {import('./contracts/ICastableModel.js').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models/admin.model.js').AdminData} AdminDataType */

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
     * @returns {null}
     */
    static get softDeleteField() {
        return null;
    }
}

/** @type {typeof Admin & (new (data: AdminDataType) => Admin & AdminDataType)} */
const AdminExport = /** @type {any} */ (Admin);
export default AdminExport;
