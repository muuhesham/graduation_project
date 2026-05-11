//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').Hobbyist} Hobbyist
 * @typedef {import('./../types/models').HobbyistResourceData} HobbyistResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class HobbyistResource extends BaseResource {
    /**
     * @param {Hobbyist | any} hobbyist
     * @returns {HobbyistResourceData}
     */
    static toArray(hobbyist) {
        return {
            nationalId: hobbyist.nationalId ?? null,
        };
    }
}
