//@ts-check

import BaseResource from './BaseResource.js';
import { makePagination } from './helpers/pagination.js';

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
        return {
            id: organizer.id ?? null,
            userId: organizer.userId ?? null,
            name: organizer.name ?? null,
            type: organizer.type ?? null,
            contactEmail: organizer.contactEmail ?? null,
            contactPhone: organizer.contactPhone ?? null,
            status: organizer.status ?? null,
            verificationStatus: organizer.verificationStatus ?? null,
            reviewedBy: organizer.reviewedBy ?? null,
            reviewedAt: organizer.reviewedAt ?? null,
            rejectionReason: organizer.rejectionReason ?? null,
            suspendReason: organizer.suspendReason ?? null,
            createdAt: organizer.createdAt ?? null,
            updatedAt: organizer.updatedAt ?? null,
        };
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
