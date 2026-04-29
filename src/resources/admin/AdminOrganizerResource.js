//@ts-check

import BaseResource from './../BaseResource.js';
import OrganizerResource from './../OrganizerResource.js';

/**
 * @typedef {import('./../../types/models').Organizer} Organizer
 * @typedef {import('./../../types/models').OrganizerResourceData} OrganizerResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class AdminOrganizerResource extends BaseResource {
    /**
     * @param {Organizer | any} organizer
     * @returns {OrganizerResourceData | null}
     */
    static make(organizer) {
        return super.make(organizer);
    }

    /**
     * @param {Organizer | any} organizer
     * @returns {OrganizerResourceData}
     */
    static toArray(organizer) {
        return OrganizerResource.toArray(organizer);
    }

    /**
     * @param {Organizer[]} items
     * @returns {OrganizerResourceData[]}
     */
    static collection(items) {
        return super.collection(items);
    }

    /**
     * @param {any} result
     * @param {string} [dataKey]
     * @returns {any}
     */
    static paginate(result, dataKey = 'organizers') {
        return super.paginate(result, dataKey);
    }
}
