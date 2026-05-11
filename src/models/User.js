//@ts-check

import BaseModel from './BaseModel.js';
import { Organizer, Governorate } from './index.js';
import { booleanCast, dateCast, numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').UserData} UserDataType */

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
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            Organizer: Organizer,
            governorate: Governorate,
        };
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
