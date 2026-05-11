//@ts-check

import BaseResource from './BaseResource.js';

/**
 * @typedef {import('./../types/models').NewsletterSubscriber} NewsletterSubscriber
 */

/**
 * @extends {BaseResource}
 */
export default class NewsletterSubscriberResource extends BaseResource {
    /**
     * @param {NewsletterSubscriber} subscriber
     */
    static toArray(subscriber) {
        return {
            id: subscriber.id,
            email: subscriber.email,
            languagePreference: subscriber.languagePreference,
            createdAt: subscriber.createdAt,
        };
    }

    /**
     * @param {any} result
     * @param {string} [dataKey]
     * @returns {any}
     */
    static paginate(result, dataKey = 'subscribers') {
        return super.paginate(result, dataKey);
    }
}
