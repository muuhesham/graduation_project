//@ts-check

import BaseModel from './BaseModel.js';

import { Organizer, State } from './index.js';
import { booleanCast, dateCast, numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */

/**
 * @typedef {import('@prisma/client').Country} CountryType
 */

/**
 * @extends {BaseModel<CountryType>}
 **/
class Country extends BaseModel {
    /** @param {CountryType} data */
    constructor(data) {
        super(data);
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'name', cast: stringCast },
            { field: 'code', cast: stringCast },
            { field: 'phoneCode', cast: stringCast },
            { field: 'taxIdLocale', cast: stringCast },
            { field: 'currencyCode', cast: stringCast },
            { field: 'currencySymbol', cast: stringCast },
            { field: 'flagEmoji', cast: stringCast },
            { field: 'isSupported', cast: booleanCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            organizers: [Organizer],
            states: [State],
        };
    }

    /**
     * @returns {string}
     */
    static get resourceName() {
        return 'country';
    }

    /**
     * @returns {string|null}
     */
    static get softDeleteField() {
        return null;
    }
}

/** @type {typeof Country & (new (data: CountryType) => Country)} */
const CountryExport = /** @type {any} */ (Country);
export default CountryExport;
