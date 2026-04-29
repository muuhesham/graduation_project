//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').Tag} Tag
 * @typedef {import('./../types/models').TagResourceData} TagResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class TagResource extends BaseResource {
    /**
     * @param {Tag | any} tag
     * @returns {TagResourceData | null}
     */
    static make(tag) {
        return super.make(tag);
    }

    /**
     * @param {Tag | any} tag
     * @returns {TagResourceData}
     */
    static toArray(tag) {
        return {
            id: tag.id ?? null,
            name: tag.name ?? null,
        };
    }

    /**
     * @param {Array<{ tag?: Tag | null } | null | undefined> | null | undefined} eventTags
     * @returns {string[]}
     */
    static namesFromEventTags(eventTags) {
        if (!Array.isArray(eventTags)) return [];

        return eventTags
            .map((eventTag) => this.make(eventTag?.tag ?? null)?.name ?? null)
            .filter((name) => typeof name === 'string');
    }
}
