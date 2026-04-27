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
     * @returns {EventResourceData | null}
     */
    static make(event) {
        return super.make(event);
    }

    /**
     * @param {Event | any} event
     * @returns {EventResourceData}
     */
    static toArray(event) {
        return EventResource.toArray(event);
    }

    /**
     * @param {Event[]} items
     * @returns {EventResourceData[]}
     */
    static collection(items) {
        return super.collection(items);
    }

    /**
     * @param {any} result
     * @param {string} [dataKey]
     * @returns {any}
     */
    static paginate(result, dataKey = 'events') {
        return super.paginate(result, dataKey);
    }
}
