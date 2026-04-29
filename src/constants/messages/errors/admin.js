//@ts-check

/**
 * @readonly
 * @enum {Object}
 */

const AdminErrors = Object.freeze({
    EMAIL_ALREADY_IN_USE: {
        code: 'EMAIL_ALREADY_IN_USE',
        message: 'Email is already in use',
    },

    ADMIN_NOT_FOUND: {
        code: 'ADMIN_NOT_FOUND',
        message: 'Admin not found',
    },

    INVALID_CREDENTIALS: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
    },
    ADMIN_NOT_APPROVED: {
        code: 'ADMIN_NOT_APPROVED',
        message: 'Admin account is not approved',
    },

    INVALID_REFRESH_TOKEN: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired admin refresh token',
    },

    INVALID_DAYS: {
        code: 'INVALID_DAYS',
        message: 'days must be a positive integer',
    },
    EVENT_DELETE_BLOCKED: {
        code: 'EVENT_DELETE_BLOCKED',
        message: 'Event cannot be deleted because it has active reservations or issued tickets.',
    },

    EVENT_NOT_DELETED: {
        code: 'EVENT_NOT_DELETED',
        message: 'Event is not deleted.',
    },
});

export default AdminErrors;
