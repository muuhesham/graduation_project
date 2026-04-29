//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').Venue} Venue
 * @typedef {import('./../types/models').VenueResourceData} VenueResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class VenueResource extends BaseResource {
    /**
     * @param {Venue | any} venue
     * @returns {VenueResourceData | null}
     */
    static make(venue) {
        return super.make(venue);
    }

    /**
     * @param {Venue | any} venue
     * @returns {VenueResourceData}
     */
    static toArray(venue) {
        return {
            id: venue.id ?? null,
            name: venue.name ?? null,
            address: venue.address ?? null,
            city: venue.city ?? null,
            state: venue.state ?? null,
            country: venue.country ?? null,
            zipCode: venue.zipCode ?? null,
            latitude: venue.latitude ?? null,
            longitude: venue.longitude ?? null,
        };
    }
}
