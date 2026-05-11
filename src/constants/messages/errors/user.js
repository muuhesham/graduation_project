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

    ALREADY_FOLLOWING: {
        code: 'USER_ALREADY_FOLLOWING',
        message: 'You are already following this organizer.',
    },

    NOT_FOLLOWING: {
        code: 'USER_NOT_FOLLOWING',
        message: 'You are not following this organizer.',
    },
});

export default UserErrors;
