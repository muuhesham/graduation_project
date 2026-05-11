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

    CANNOT_FOLLOW_SELF: {
        code: 'CANNOT_FOLLOW_SELF',
        message: 'You cannot follow your own organizer profile',
    },
});

export default UserErrors;
