//@ts-check

import BaseResource from './../BaseResource.js';
import EventResource from './../EventResource.js';

/**
 * @typedef {import('./../../types/models').Event} Event
 * @typedef {import('./../../types/models').EventResourceData} EventResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class AdminEventResource extends BaseResource {
    /**
     * @param {Event | any} event
     * @returns {EventResourceData}
     */
    static toArray(event) {
        return EventResource.toArray(event);
    }
}
