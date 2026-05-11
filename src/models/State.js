//@ts-check

import BaseModel from './BaseModel.js';

import Organizer from './Organizer.js';
import { dateCast, numberCast, stringCast } from './casts.js';
import { City, Country } from './index.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/**
 * @typedef {import('./../types/models').StateData} StateDataType
 */

/**
 * @extends {BaseModel<StateDataType>}
 **/
class State extends BaseModel {
    /** @param {StateDataType} data */
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
            { field: 'countryId', cast: numberCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
            { field: 'deletedAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            country: Country,
            organizers: [Organizer],
            cities: [City],
        };
    }

    static get resourceName() {
        return 'state';
    }

    /**
     * @returns {string | null}
     */
    static get softDeleteField() {
        return null;
    }
}

/** @type {typeof State & (new (data: StateDataType) => State )} */
const StateExport = /** @type {any} */ (State);
export default StateExport;
