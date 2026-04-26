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
     * @returns {OrganizerResourceData}
     */
    static toArray(organizer) {
        return OrganizerResource.toArray(organizer);
    }
}
