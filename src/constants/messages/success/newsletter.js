//@ts-check

/**
 * @typedef {object} SuccessDescriptor
 * @property {string} code
 * @property {string} message
 */

const NewsletterSuccess = Object.freeze({
    SUBSCRIBE_SENT: {
        code: 'NEWSLETTER_SUBSCRIBE_SENT',
        message: 'Confirmation email sent!',
    },
    CONFIRMED: {
        code: 'NEWSLETTER_CONFIRMED',
        message: 'Successfully subscribed to the newsletter!',
    },
});

export default NewsletterSuccess;
