//@ts-check

/**
 * @readonly
 * @enum {Object}
 */
const OrganizerErrors = Object.freeze({
    ORGANIZER_NOT_FOUND: {
        code: 'ORGANIZER_NOT_FOUND',
        message: 'Organizer not found',
    },

    ORGANIZER_ALREADY_EXISTS: {
        code: 'ORGANIZER_ALREADY_EXISTS',
        message: 'Organizer already exists',
    },

    INVALID_ORGANIZER_TYPE: {
        code: 'INVALID_ORGANIZER_TYPE',
        message: 'Invalid organizer type',
    },

    INVALID_ORGANIZER_VERIFICATION_STATUS: {
        code: 'INVALID_ORGANIZER_VERIFICATION_STATUS',
        message: 'Invalid organizer verification status',
    },

    INVALID_ORGANIZER_STATUS: {
        code: 'INVALID_ORGANIZER_STATUS',
        message: 'Invalid organizer status',
    },

    ORGANIZER_SUSPENDED: {
        code: 'ORGANIZER_SUSPENDED',
        message: 'Organizer is suspended',
    },

    ORGANIZER_REJECTED: {
        code: 'ORGANIZER_REJECTED',
        message: 'Organizer application was rejected',
    },

    ORGANIZER_PENDING_VERIFICATION: {
        code: 'ORGANIZER_PENDING_VERIFICATION',
        message: 'Organizer is pending verification',
    },

    ORGANIZER_ACCOUNT_NOT_ACTIVE: {
        code: 'ORGANIZER_ACCOUNT_NOT_ACTIVE',
        message: 'Organizer account is not active',
    },

    ORGANIZER_NOT_APPROVED_FOR_EVENT_CREATION: {
        code: 'ORGANIZER_NOT_APPROVED_FOR_EVENT_CREATION',
        message: 'Only approved organizers can create events',
    },

    ORGANIZER_NOT_ACTIVE_FOR_EVENT_CREATION: {
        code: 'ORGANIZER_NOT_ACTIVE_FOR_EVENT_CREATION',
        message: 'Only active organizers can create events',
    },

    ORGANIZER_NOT_APPROVED_FOR_DASHBOARD_ACCESS: {
        code: 'ORGANIZER_NOT_APPROVED_FOR_DASHBOARD_ACCESS',
        message: 'Only approved organizers can access the dashboard',
    },

    ORGANIZER_NOT_ACTIVE_FOR_DASHBOARD_ACCESS: {
        code: 'ORGANIZER_NOT_ACTIVE_FOR_DASHBOARD_ACCESS',
        message: 'Only active organizers can access the dashboard',
    },

    ORGANIZER_NOT_VERIFIED_TO_READ_EVENTS: {
        code: 'ORGANIZER_NOT_VERIFIED_TO_READ_EVENTS',
        message: 'Individual organizers must be verified to read events',
    },

    ORGANIZER_EVENT_READ_FORBIDDEN: {
        code: 'ORGANIZER_EVENT_READ_FORBIDDEN',
        message: 'Organizers can only read their own events',
    },

    ORGANIZER_NOT_VERIFIED_TO_UPDATE_EVENTS: {
        code: 'ORGANIZER_NOT_VERIFIED_TO_UPDATE_EVENTS',
        message: 'Individual organizers must be verified to update events',
    },

    ORGANIZER_EVENT_UPDATE_FORBIDDEN: {
        code: 'ORGANIZER_EVENT_UPDATE_FORBIDDEN',
        message: 'Organizers can only update their own events',
    },

    ORGANIZER_NOT_VERIFIED_TO_DELETE_EVENTS: {
        code: 'ORGANIZER_NOT_VERIFIED_TO_DELETE_EVENTS',
        message: 'Individual organizers must be verified to delete events',
    },

    ORGANIZER_EVENT_DELETE_FORBIDDEN: {
        code: 'ORGANIZER_EVENT_DELETE_FORBIDDEN',
        message: 'Organizers can only delete their own events',
    },

    ORGANIZER_NOT_VERIFIED_TO_MANAGE_ATTENDEES: {
        code: 'ORGANIZER_NOT_VERIFIED_TO_MANAGE_ATTENDEES',
        message: 'Individual organizers must be verified to manage attendees',
    },

    ORGANIZER_ATTENDEE_MANAGEMENT_FORBIDDEN: {
        code: 'ORGANIZER_ATTENDEE_MANAGEMENT_FORBIDDEN',
        message: 'Organizers can only manage attendees for their own events',
    },

    ORGANIZER_NOT_VERIFIED_TO_MANAGE_TICKETS: {
        code: 'ORGANIZER_NOT_VERIFIED_TO_MANAGE_TICKETS',
        message: 'Individual organizers must be verified to manage tickets',
    },

    ORGANIZER_TICKET_MANAGEMENT_FORBIDDEN: {
        code: 'ORGANIZER_TICKET_MANAGEMENT_FORBIDDEN',
        message: 'Organizers can only manage tickets for their own events',
    },

    ORGANIZER_NOT_VERIFIED_TO_MANAGE_PROMOTIONS: {
        code: 'ORGANIZER_NOT_VERIFIED_TO_MANAGE_PROMOTIONS',
        message: 'Individual organizers must be verified to manage promotions',
    },

    ORGANIZER_PROMOTION_MANAGEMENT_FORBIDDEN: {
        code: 'ORGANIZER_PROMOTION_MANAGEMENT_FORBIDDEN',
        message: 'Organizers can only manage promotions for their own events',
    },

    ORGANIZER_NOT_VERIFIED_TO_MANAGE_VENUES: {
        code: 'ORGANIZER_NOT_VERIFIED_TO_MANAGE_VENUES',
        message: 'Individual organizers must be verified to manage venues',
    },

    ORGANIZER_VENUE_MANAGEMENT_FORBIDDEN: {
        code: 'ORGANIZER_VENUE_MANAGEMENT_FORBIDDEN',
        message: 'Organizers can only manage venues for their own events',
    },

    ORGANIZER_REFERENCE_CONSTRAINT_VIOLATION: {
        code: 'ORGANIZER_REFERENCE_CONSTRAINT_VIOLATION',
        message: 'Invalid reference for organizer',
    },

    ORGANIZER_CONTACT_EMAIL_NOT_VERIFIED: {
        code: 'ORGANIZER_CONTACT_EMAIL_NOT_VERIFIED',
        message: 'Organizer contact email is not verified',
    },

    ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED: {
        code: 'ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED',
        message: 'Organizer contact email is already verified',
    },

    ORGANIZER_ALREADY_APPROVED: {
        code: 'ORGANIZER_ALREADY_APPROVED',
        message: 'Organizer is already approved',
    },

    ORGANIZER_ALREADY_REJECTED: {
        code: 'ORGANIZER_ALREADY_REJECTED',
        message: 'Organizer is already rejected',
    },

    ORGANIZER_ALREADY_SUSPENDED: {
        code: 'ORGANIZER_ALREADY_SUSPENDED',
        message: 'Organizer is already suspended',
    },

    ORGANIZER_NOT_SUSPENDED: {
        code: 'ORGANIZER_NOT_SUSPENDED',
        message: 'Organizer is not suspended',
    },
});

export default OrganizerErrors;
