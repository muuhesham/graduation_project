//@ts-check

import BaseRepository from './BaseRepository.js';
import { NewsletterSubscriber as NewsletterSubscriberModel } from '../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/shared').RepositoryModelClass<NewsletterSubscriber>} NewsletterSubscriberClass
 * @typedef {import('./../types/models').NewsletterSubscriber} NewsletterSubscriber
 * @typedef {import('./../types/models').NewsletterSubscriberCreate} NewsletterSubscriberCreate
 * @typedef {import('./../types/models').NewsletterSubscriberUpdate} NewsletterSubscriberUpdate
 * @typedef {import('./../types/models').NewsletterSubscriberWhere} NewsletterSubscriberWhere
 * @typedef {import('./../types/models').NewsletterSubscriberSelect} NewsletterSubscriberSelect
 * @typedef {import('./../types/models').NewsletterSubscriberInclude} NewsletterSubscriberInclude
 */

/**
 * @extends {BaseRepository<NewsletterSubscriber, NewsletterSubscriberCreate, NewsletterSubscriberUpdate, NewsletterSubscriberWhere, NewsletterSubscriberSelect, NewsletterSubscriberInclude>}
 */
class NewsletterRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, NewsletterSubscriberModel, {
            searchFields: ['email'],
        });
    }

    /**
     * @param {string} email
     * @returns {Promise<NewsletterSubscriber | null>}
     */
    async findByEmail(email) {
        return super.findUnique({ where: { email } });
    }
}

export default NewsletterRepository;
