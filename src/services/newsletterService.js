//@ts-check

import { newsletterRepository } from './../repositories/index.js';
import jwt from 'jsonwebtoken';
import { NEWSLETTER_JWT_KEY, NEWSLETTER_JWT_EXPIRY, APP_URL } from '../config/env.js';
import mailService from './mailService.js';
import userService from './userService.js';
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
 * @typedef {typeof import('./userService').default} UserService
 */

class NewsletterService {
    /** @type {NewsletterRepository} */
    #newsletterRepository;

    /** @type {UserService} */
    #userService;

    /** @type {typeof mailService} */
    #mailService;

    /**
     * @param {NewsletterRepository} newsletterRepository
     * @param {UserService} userService
     * @param {typeof mailService} mailService
     */
    constructor(newsletterRepository, userService, mailService) {
        this.#newsletterRepository = newsletterRepository;
        this.#userService = userService;
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
        // Point link to frontend confirmation page instead of backend API
        const confirmationUrl = `${FRONT_URL}/${language}/newsletter/confirmation?token=${token}`;

        try {
            await this.#mailService.sendNewsletterConfirmationJob(confirmationUrl, email, language);
        } catch (error) {
            console.error('[NewsletterService] Failed to send confirmation email:', error);
        }
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
            throw new ConflictError(
                NewsletterErrors.ALREADY_SUBSCRIBED.message,
                NewsletterErrors.ALREADY_SUBSCRIBED.code
            );
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
        // Ensure expiresIn is either a string (e.g. '1h') or a positive number
        const expiresIn = NEWSLETTER_JWT_EXPIRY || '1h';

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
        const [subscribers, userEmails] = await Promise.all([
            this.#newsletterRepository.findMany({ select: { email: true } }),
            this.#userService.getAllUserEmails(),
        ]);

        const recipientEmails = new Set();
        subscribers.forEach((s) => recipientEmails.add(s.email));
        userEmails.forEach((email) => recipientEmails.add(email));

        for (const email of recipientEmails) {
            try {
                await this.#mailService.sendRawMail({
                    to: email,
                    subject: payload.subject,
                    body: payload.content,
                });
            } catch (error) {
                console.error(`[NewsletterService] Failed to send broadcast to ${email}:`, error);
            }
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

export default new NewsletterService(newsletterRepository, userService, mailService);
export { NewsletterService };
