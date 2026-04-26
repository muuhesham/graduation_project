//@ts-check

import BaseModel from './BaseModel.js';
import { booleanCast, dateCast, numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel.js').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models/user.model.js').UserData} UserDataType */

/**
 * @extends {BaseModel<UserDataType>}
 */
class User extends BaseModel {
    /**
     * @param {UserDataType} data
     */
    constructor(data) {
        super(data);
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: stringCast },
            { field: 'name', cast: stringCast },
            { field: 'email', cast: stringCast },
            { field: 'phone', cast: stringCast },
            { field: 'gender', cast: stringCast },
            { field: 'role', cast: stringCast },
            { field: 'location', cast: stringCast },
            { field: 'languagePreference', cast: stringCast },
            { field: 'isVerified', cast: booleanCast },
            { field: 'isCompleted', cast: booleanCast },
            { field: 'birthDate', cast: dateCast },
            { field: 'governorateId', cast: numberCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
            { field: 'deletedAt', cast: dateCast },
        ];
    }

    static get resourceName() {
        return 'user';
    }

    /**
     * @returns {string}
     */
    static get softDeleteField() {
        return 'deletedAt';
    }

    canBeDeleted() {
        return true;
    }
}

/** @type {typeof User & (new (data: UserDataType) => User & UserDataType)} */
const UserExport = /** @type {any} */ (User);
export default UserExport;
