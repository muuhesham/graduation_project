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

    ORGANIZER_NOT_APPROVED: {
        code: 'ORGANIZER_NOT_APPROVED',
        message: 'Organizer account is not approved',
    },

    ORGANIZER_ACCOUNT_NOT_ACTIVE: {
        code: 'ORGANIZER_ACCOUNT_NOT_ACTIVE',
        message: 'Organizer account is not active',
    },

    ORGANIZER_ACTION_FORBIDDEN: {
        code: 'ORGANIZER_ACTION_FORBIDDEN',
        message: 'You do not have permission to perform this action on this resource',
    },

    ORGANIZER_REFERENCE_CONSTRAINT_VIOLATION: {
        code: 'ORGANIZER_REFERENCE_CONSTRAINT_VIOLATION',
        message: 'Invalid reference for organizer',
    },

    ORGANIZER_COUNTRY_NOT_FOUND: {
        code: 'ORGANIZER_COUNTRY_NOT_FOUND',
        message: 'Referenced country does not exist',
    },

    ORGANIZER_STATE_NOT_FOUND: {
        code: 'ORGANIZER_STATE_NOT_FOUND',
        message: 'Referenced state does not exist',
    },

    ORGANIZER_CITY_NOT_FOUND: {
        code: 'ORGANIZER_CITY_NOT_FOUND',
        message: 'Referenced city does not exist',
    },

    ORGANIZER_EMAIL_ALREADY_IN_USE: {
        code: 'ORGANIZER_EMAIL_ALREADY_IN_USE',
        message: 'Contact email is already in use by another organizer',
    },

    ORGANIZER_PHONE_ALREADY_IN_USE: {
        code: 'ORGANIZER_PHONE_ALREADY_IN_USE',
        message: 'Contact phone is already in use by another organizer',
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

    ORGANIZER_ALREADY_FOLLOWED: {
        code: 'ORGANIZER_ALREADY_FOLLOWED',
        message: 'You are already following this organizer',
    },

    ORGANIZER_NOT_FOLLOWED: {
        code: 'ORGANIZER_NOT_FOLLOWED',
        message: 'You are not following this organizer',
    },
});

export default OrganizerErrors;
