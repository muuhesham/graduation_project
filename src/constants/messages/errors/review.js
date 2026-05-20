//@ts-check

/**
 * @readonly
 * @enum {Object}
 */
const ReviewErrors = Object.freeze({
    REVIEW_NOT_FOUND: {
        code: 'REVIEW_NOT_FOUND',
        message: 'Review not found',
    },

    EVENT_NOT_BOOKED: {
        code: 'EVENT_NOT_BOOKED',
        message: 'You must book this event before you can review it',
    },

    CANNOT_REVIEW_OWN_EVENT: {
        code: 'CANNOT_REVIEW_OWN_EVENT',
        message: 'You cannot review your own event',
    },

    UNAUTHORIZED_REVIEW_ACTION: {
        code: 'UNAUTHORIZED_REVIEW_ACTION',
        message: 'You are not authorized to perform this action on this review',
    },
});

export default ReviewErrors;
