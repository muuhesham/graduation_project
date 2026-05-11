//@ts-check

import organizerVerificationStatus from './../constants/enums/organizerVerificationStatus.js';
import organizerStatus from './../constants/enums/organizerStatus.js';

import OrganizerErrors from './../constants/messages/errors/organizer.js';

import ForbiddenError from './../errors/ForbiddenError.js';
import NotFoundError from './../errors/NotFoundError.js';

/**
 * @typedef {import('./../types/models').Organizer} Organizer
 *
 * @typedef {import('../types/models').Event} Event
 */

class OrganizerPolicy {
    /** @param {Organizer} organizer */
    canCreateEvent(organizer) {
        this.#ensureVerifiedAndActive(organizer);
        return true;
    }

    /**
     * @param {Organizer} organizer
     * @throws {NotFoundError}
     * @throws {ForbiddenError}
     */
    canAccessDashboard(organizer) {
        this.#ensureVerifiedAndActive(organizer);
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canViewEvent(organizer, event) {
        this.#ensureVerifiedAndActive(organizer);
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_ACTION_FORBIDDEN]);
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canUpdateEvent(organizer, event) {
        this.#ensureVerifiedAndActive(organizer);
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_ACTION_FORBIDDEN]);
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canDeleteEvent(organizer, event) {
        this.#ensureVerifiedAndActive(organizer);
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_ACTION_FORBIDDEN]);
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canCancelEvent(organizer, event) {
        this.#ensureVerifiedAndActive(organizer);
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_ACTION_FORBIDDEN]);
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canManageAttendees(organizer, event) {
        this.#ensureVerifiedAndActive(organizer);
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_ACTION_FORBIDDEN]);
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canManageTickets(organizer, event) {
        this.#ensureVerifiedAndActive(organizer);
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_ACTION_FORBIDDEN]);
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canManagePromotions(organizer, event) {
        this.#ensureVerifiedAndActive(organizer);
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_ACTION_FORBIDDEN]);
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canManageVenues(organizer, event) {
        this.#ensureVerifiedAndActive(organizer);
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_ACTION_FORBIDDEN]);
        }
    }

    /**
     * @param {Organizer} organizer
     */
    #ensureVerifiedAndActive(organizer) {
        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }
        if (organizer.verificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_APPROVED]);
        }
        if (organizer.status !== organizerStatus.ACTIVE) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_ACCOUNT_NOT_ACTIVE]);
        }

        if (!organizer.isContactEmailVerified) {
            throw new ForbiddenError(undefined, undefined, [OrganizerErrors.ORGANIZER_CONTACT_EMAIL_NOT_VERIFIED]);
        }
    }
}

export default new OrganizerPolicy();
export { OrganizerPolicy };
