//@ts-check

import BaseModel from './BaseModel.js';
import { booleanCast, dateCast, numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').OtpData} OtpDataType */

/** @extends {BaseModel<OtpDataType>} */
class Otp extends BaseModel {
    /** @param {OtpDataType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'otp';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'email', cast: stringCast },
            { field: 'code', cast: stringCast },
            { field: 'isUsed', cast: booleanCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'expiresAt', cast: dateCast },
        ];
    }
}

/** @type {typeof Otp & (new (data: OtpDataType) => Otp & OtpDataType)} */
const OtpExport = /** @type {any} */ (Otp);
export default OtpExport;
