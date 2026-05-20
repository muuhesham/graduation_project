//@ts-check

import BaseResource from './BaseResource.js';
import HobbyistResource from './HobbyistResource.js';
import BusinessResource from './BusinessResource.js';
import CompanyResource from './CompanyResource.js';

/**
 * @typedef {import('./../types/models').Organizer} Organizer
 * @typedef {import('./../types/models').OrganizerResourceData} OrganizerResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class OrganizerResource extends BaseResource {
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
        /** @type {OrganizerResourceData} */
        const data = {
            id: organizer.id ?? null,
            userId: organizer.userId ?? null,
            name: organizer.name ?? null,
            description: organizer.description ?? null,
            type: organizer.type ?? null,
            contactEmail: organizer.contactEmail ?? null,
            contactPhone: organizer.contactPhone ?? null,
            websiteUrl: organizer.websiteUrl ?? null,
            instagramUrl: organizer.instagramUrl ?? null,
            facebookUrl: organizer.facebookUrl ?? null,
            twitterUrl: organizer.twitterUrl ?? null,
            linkedinUrl: organizer.linkedinUrl ?? null,
            youtubeUrl: organizer.youtubeUrl ?? null,
            logoUrl: organizer.logoUrl ?? null,
            coverUrl: organizer.coverUrl ?? null,
            stripeAccountId: organizer.stripeAccountId ?? null,
            isContactPhoneVerified: organizer.isContactPhoneVerified ?? false,
            isContactEmailVerified: organizer.isContactEmailVerified ?? false,
            status: organizer.status ?? null,
            verificationStatus: organizer.verificationStatus ?? null,
            reviewedBy: organizer.reviewedBy ?? null,
            reviewedAt: organizer.reviewedAt ?? null,
            rejectionReason: organizer.rejectionReason ?? null,
            suspendReason: organizer.suspendReason ?? null,
            createdAt: organizer.createdAt ?? null,
            updatedAt: organizer.updatedAt ?? null,
        };

        if (organizer.hobbyist) {
            data.hobbyist = HobbyistResource.make(organizer.hobbyist);
        }

        if (organizer.business) {
            data.business = BusinessResource.make(organizer.business);
        }

        if (organizer.company) {
            data.company = CompanyResource.make(organizer.company);
        }

        return data;
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
     * @returns {import('./../types/models').OrganizerPaginatedResource}
     */
    static paginate(result) {
        return super.paginate(result, 'data');
    }
}
