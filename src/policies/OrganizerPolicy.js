//@ts-check

import organizerVerificationStatus from './../constants/enums/organizerVerificationStatus.js';
import organizerStatus from './../constants/enums/organizerStatus.js';

import OrganizerErrors from './../constants/messages/errors/organizer.js';

import ForbiddenError from './../errors/ForbiddenError.js';
import NotFoundError from './../errors/NotFoundError.js';

/**
 * @typedef {import('./../types/models').Organizer} Organizer
 *
 * @typedef {import('../types/models/index.js').Event} Event
 */

class OrganizerPolicy {
    /** @param {Organizer} organizer */
    canCreateEvent(organizer) {
        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }

        if (organizer.verificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_APPROVED_FOR_EVENT_CREATION.message,
                OrganizerErrors.ORGANIZER_NOT_APPROVED_FOR_EVENT_CREATION.code
            );
        }
        if (organizer.status !== organizerStatus.ACTIVE) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_ACTIVE_FOR_EVENT_CREATION.message,
                OrganizerErrors.ORGANIZER_NOT_ACTIVE_FOR_EVENT_CREATION.code
            );
        }
        return true;
    }

    /**
     * @param {Organizer} organizer
     * @throws {NotFoundError}
     * @throws {ForbiddenError}
     */
    canAccessDashboard(organizer) {
        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }
        if (organizer.verificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_APPROVED_FOR_DASHBOARD_ACCESS.message,
                OrganizerErrors.ORGANIZER_NOT_APPROVED_FOR_DASHBOARD_ACCESS.code
            );
        }
        if (organizer.status !== organizerStatus.ACTIVE) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_ACTIVE_FOR_DASHBOARD_ACCESS.message,
                OrganizerErrors.ORGANIZER_NOT_ACTIVE_FOR_DASHBOARD_ACCESS.code
            );
        }

        if (!organizer.isContactEmailVerified) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_NOT_VERIFIED.message,
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_NOT_VERIFIED.code
            );
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canViewEvent(organizer, event) {
        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }
        if (organizer.verificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_READ_EVENTS.message,
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_READ_EVENTS.code
            );
        }
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_EVENT_READ_FORBIDDEN.message,
                OrganizerErrors.ORGANIZER_EVENT_READ_FORBIDDEN.code
            );
        }
    }

    /**
     * @param {any} organizer
     * @param {any} event
     */
    canUpdateEvent(organizer, event) {
        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }
        if (organizer.organizerVerificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_UPDATE_EVENTS.message,
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_UPDATE_EVENTS.code
            );
        }
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_EVENT_UPDATE_FORBIDDEN.message,
                OrganizerErrors.ORGANIZER_EVENT_UPDATE_FORBIDDEN.code
            );
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canDeleteEvent(organizer, event) {
        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }
        if (organizer.verificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_DELETE_EVENTS.message,
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_DELETE_EVENTS.code
            );
        }
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_EVENT_DELETE_FORBIDDEN.message,
                OrganizerErrors.ORGANIZER_EVENT_DELETE_FORBIDDEN.code
            );
        }
        if (organizer.status !== organizerStatus.ACTIVE) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_ACCOUNT_NOT_ACTIVE.message,
                OrganizerErrors.ORGANIZER_ACCOUNT_NOT_ACTIVE.code
            );
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canManageAttendees(organizer, event) {
        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }
        if (organizer.verificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_MANAGE_ATTENDEES.message,
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_MANAGE_ATTENDEES.code
            );
        }
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_ATTENDEE_MANAGEMENT_FORBIDDEN.message,
                OrganizerErrors.ORGANIZER_ATTENDEE_MANAGEMENT_FORBIDDEN.code
            );
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canManageTickets(organizer, event) {
        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }
        if (organizer.verificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_MANAGE_TICKETS.message,
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_MANAGE_TICKETS.code
            );
        }
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_TICKET_MANAGEMENT_FORBIDDEN.message,
                OrganizerErrors.ORGANIZER_TICKET_MANAGEMENT_FORBIDDEN.code
            );
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canManagePromotions(organizer, event) {
        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }
        if (organizer.verificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_MANAGE_PROMOTIONS.message,
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_MANAGE_PROMOTIONS.code
            );
        }
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_PROMOTION_MANAGEMENT_FORBIDDEN.message,
                OrganizerErrors.ORGANIZER_PROMOTION_MANAGEMENT_FORBIDDEN.code
            );
        }
    }

    /**
     * @param {Organizer} organizer
     * @param {Event} event
     */
    canManageVenues(organizer, event) {
        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }
        if (organizer.verificationStatus !== organizerVerificationStatus.APPROVED) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_MANAGE_VENUES.message,
                OrganizerErrors.ORGANIZER_NOT_VERIFIED_TO_MANAGE_VENUES.code
            );
        }
        if (organizer.id !== event.organizerId) {
            throw new ForbiddenError(
                OrganizerErrors.ORGANIZER_VENUE_MANAGEMENT_FORBIDDEN.message,
                OrganizerErrors.ORGANIZER_VENUE_MANAGEMENT_FORBIDDEN.code
            );
        }
    }
}

export default new OrganizerPolicy();
export { OrganizerPolicy };
