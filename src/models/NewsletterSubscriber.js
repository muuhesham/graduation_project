//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('@prisma/client').NewsletterSubscriber} NewsletterSubscriberData */

/**
 * @extends {BaseModel<NewsletterSubscriberData>}
 */
class NewsletterSubscriber extends BaseModel {
    /**
     * @param {NewsletterSubscriberData} data
     */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'newsletterSubscriber';
    }

    static get softDeleteField() {
        return null;
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: stringCast },
            { field: 'email', cast: stringCast },
            { field: 'languagePreference', cast: stringCast },
            { field: 'createdAt', cast: dateCast },
        ];
    }
}

/** @type {typeof NewsletterSubscriber & (new (data: NewsletterSubscriberData) => NewsletterSubscriber & NewsletterSubscriberData)} */
const NewsletterSubscriberExport = /** @type {any} */ (NewsletterSubscriber);
export default NewsletterSubscriberExport;
