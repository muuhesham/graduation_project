//@ts-check

import BaseModel from './BaseModel.js';
import { numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('@prisma/client').AdminRefreshToken} RefreshTokenType */

/** @extends {BaseModel<RefreshTokenType>} */
class AdminRefreshToken extends BaseModel {
    /** @param {RefreshTokenType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'adminRefreshToken';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'adminId', cast: numberCast },
            { field: 'token', cast: stringCast },
        ];
    }
}

/** @type {typeof AdminRefreshToken & (new (data: RefreshTokenType) => AdminRefreshToken & RefreshTokenType)} */
const AdminRefreshTokenExport = /** @type {any} */ (AdminRefreshToken);
export default AdminRefreshTokenExport;
