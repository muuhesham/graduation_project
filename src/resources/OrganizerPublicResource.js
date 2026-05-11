//@ts-check

import BaseResource from './BaseResource.js';
import { EventResource } from './index.js';

/**
 * @typedef {import('./../types/models').Organizer} Organizer
 * @typedef {import('./../types/models').Event} Event
 */

export default class OrganizerPublicResource extends BaseResource {
    /**
     * @param {Organizer | any} organizer
     * @returns {object | null}
     */
    static make(organizer) {
        if (!organizer) return null;

        const data = this.toArray(organizer);

        if (organizer.Event) {
            data.events = EventResource.collection(organizer.Event);
        }

        return data;
    }

    /**
     * @param {Organizer | any} organizer
     * @returns {object}
     */
    static toArray(organizer) {
        return {
            id: organizer.id,
            name: organizer.name,
            description: organizer.description,
            type: organizer.type,
            websiteUrl: organizer.websiteUrl,
            instagramUrl: organizer.instagramUrl,
            facebookUrl: organizer.facebookUrl,
            twitterUrl: organizer.twitterUrl,
            linkedinUrl: organizer.linkedinUrl,
            youtubeUrl: organizer.youtubeUrl,
            logoUrl: organizer.logoUrl || null,
            coverUrl: organizer.coverUrl || null,
            followerCount: organizer._count?.followers ?? 0,
            isFollowing: organizer.isFollowing ?? false,
            createdAt: organizer.createdAt,
        };
    }
}
