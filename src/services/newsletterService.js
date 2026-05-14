//@ts-check

import { newsletterRepository } from './../repositories/index.js';
import jwt from 'jsonwebtoken';
import { NEWSLETTER_JWT_KEY, NEWSLETTER_JWT_EXPIRY, APP_URL } from '../config/env.js';
import mailService from './mailService.js';
import ConflictError from '../errors/ConflictError.js';
import NewsletterErrors from '../constants/messages/errors/newsletter.js';

/**
 * @typedef {import('./../types/models').NewsletterSubscriber} NewsletterSubscriber
 * @typedef {import('./../types/models').NewsletterFilters} NewsletterFilters
 * @typedef {import('./../types/shared').TransactionClient} TransactionClient
 * @typedef {import('./../types/shared').PaginatedResult<NewsletterSubscriber>} NewsletterPaginatedResult
 * @typedef {import('@prisma/client').Language} Language
 * @typedef {import('jsonwebtoken').Secret} Secret
 * @typedef {import('./../repositories/NewsletterRepository').default} NewsletterRepository
 */

class NewsletterService {
    /** @type {NewsletterRepository} */
    #newsletterRepository;

    /** @type {typeof mailService} */
    #mailService;

    /**
     * @param {NewsletterRepository} newsletterRepository
     * @param {typeof mailService} mailService
     */
    constructor(newsletterRepository, mailService) {
        this.#newsletterRepository = newsletterRepository;
        this.#mailService = mailService;
    }

    /**
     * @param {string} email
     * @param {Language} [language='en']
     * @returns {Promise<void>}
     */
    async subscribe(email, language = 'en') {
        const existing = await this.#newsletterRepository.findByEmail(email);
        if (existing) {
            throw new ConflictError(
                NewsletterErrors.ALREADY_SUBSCRIBED.message,
                NewsletterErrors.ALREADY_SUBSCRIBED.code
            );
        }

        const token = this.signSubscriptionToken(email, language);
        const confirmationUrl = `${APP_URL}/api/v1/newsletter/confirm/${token}`;

        await this.#mailService.sendNewsletterConfirmationJob(confirmationUrl, email, language);
    }

    /**
     * @param {string} token
     * @returns {Promise<NewsletterSubscriber>}
     */
    async confirmSubscription(token) {
        if (!NEWSLETTER_JWT_KEY) {
            throw new Error('NEWSLETTER_JWT_KEY is not defined');
        }

        const { email, language } = /** @type {{ email: string, language: Language }} */ (
            jwt.verify(token, NEWSLETTER_JWT_KEY)
        );

        const existing = await this.#newsletterRepository.findByEmail(email);
        if (existing) {
            throw new ConflictError(undefined, undefined, [NewsletterErrors.ALREADY_SUBSCRIBED]);
        }

        const subscriber = await this.#newsletterRepository.create({
            email,
            languagePreference: language,
        });

        try {
            await this.#mailService.sendQueued({
                to: subscriber.email,
                subject: 'Welcome to our Newsletter!',
                templateName: 'newsletterWelcomeMail',
                variables: {
                    email: subscriber.email,
                    plainText: `Thank you for subscribing to our newsletter! You'll now receive the latest updates directly in your inbox.`,
                },
            });
        } catch (mailError) {
            console.error('Failed to send welcome email:', mailError);
        }

        return subscriber;
    }

    /**
     * @param {string} email
     * @param {Language} language
     * @returns {string}
     */
    signSubscriptionToken(email, language) {
        if (!NEWSLETTER_JWT_KEY) {
            throw new Error('NEWSLETTER_JWT_KEY is not defined');
        }

        const secret = /** @type {Secret} */ (NEWSLETTER_JWT_KEY);
        const expiresIn = /** @type {any} */ (NEWSLETTER_JWT_EXPIRY);

        return jwt.sign({ email, language }, secret, {
            expiresIn,
        });
    }

    /**
     * @param {object} payload
     * @param {string} payload.subject
     * @param {string} payload.content
     * @returns {Promise<void>}
     */
    async broadcast(payload) {
        const subscribers = await this.#newsletterRepository.findMany();

        for (const subscriber of subscribers) {
            await this.#mailService.sendRawMail({
                to: subscriber.email,
                subject: payload.subject,
                body: payload.content,
            });
        }
    }

    /**
     * @param {NewsletterFilters} [options]
     * @returns {Promise<NewsletterPaginatedResult>}
     */
    async list(options = {}) {
        return this.#newsletterRepository.paginate(options);
    }
}

export default new NewsletterService(newsletterRepository, mailService);
export { NewsletterService };
