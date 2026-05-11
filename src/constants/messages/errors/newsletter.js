//@ts-check

/**
 * @typedef {import('./../../../types/shared/common.types').ErrorDescriptor} ErrorDescriptor
 */

const NewsletterErrors = Object.freeze({
    ALREADY_SUBSCRIBED: {
        code: 'NEWSLETTER_ALREADY_SUBSCRIBED',
        message: 'You are already subscribed to our newsletter.',
    },
    INVALID_TOKEN: {
        code: 'NEWSLETTER_INVALID_TOKEN',
        message: 'The subscription token is invalid or has expired.',
    },
    TOKEN_REQUIRED: {
        code: 'NEWSLETTER_TOKEN_REQUIRED',
        message: 'Subscription token is required.',
    },
});

export default NewsletterErrors;
