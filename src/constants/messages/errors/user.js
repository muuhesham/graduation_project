//@ts-check

/**
 * @readonly
 * @enum {Object}
 */
const UserErrors = Object.freeze({
    USER_NOT_FOUND: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
    },

    EMAIL_NOT_VERIFIED: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'User email is not verified',
    },

    ALREADY_ORGANIZER: {
        code: 'ALREADY_ORGANIZER',
        message: 'User is already an organizer',
    },
});

export default UserErrors;
