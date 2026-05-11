//@ts-check

import BaseModel from './BaseModel.js';
import { booleanCast, dateCast, numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').PhoneOtpData} PhoneOtpDataType */

/** @extends {BaseModel<PhoneOtpDataType>} */
class PhoneOtp extends BaseModel {
    /** @param {PhoneOtpDataType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'phoneOtp';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'phone', cast: stringCast },
            { field: 'code', cast: stringCast },
            { field: 'isUsed', cast: booleanCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'expiresAt', cast: dateCast },
        ];
    }
}

/** @type {typeof PhoneOtp & (new (data: PhoneOtpDataType) => PhoneOtp & PhoneOtpDataType)} */
const PhoneOtpExport = /** @type {any} */ (PhoneOtp);
export default PhoneOtpExport;
