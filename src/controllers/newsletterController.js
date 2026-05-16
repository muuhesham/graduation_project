//@ts-check

import { sendSuccess } from '../utils/response.js';
import {
    NEWSLETTER_CONFIRMATION_SUCCESS_URL,
    NEWSLETTER_CONFIRMATION_FAILURE_URL,
    NEWSLETTER_CONFIRMATION_ALREADY_SUBSCRIBED_URL,
} from '../config/env.js';
import newsletterService from '../services/newsletterService.js';
import ConflictError from '../errors/ConflictError.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import NewsletterSuccess from '../constants/messages/success/newsletter.js';

const newsletterController = {
    subscribe: asyncWrapper(async (req, res) => {
        const { email, language } = req.body;

        await newsletterService.subscribe(email, language);
        
        return sendSuccess(res, NewsletterSuccess.SUBSCRIBE_SENT);
    }),

    confirmSubscription: asyncWrapper(async (req, res) => {
        const token = req.params.token;

        if (!token) {
            return res.redirect(NEWSLETTER_CONFIRMATION_FAILURE_URL || '/');
        }

        try {
            await newsletterService.confirmSubscription(token);
            return res.redirect(NEWSLETTER_CONFIRMATION_SUCCESS_URL || '/');
        } catch (error) {
            if (error instanceof ConflictError) {
                return res.redirect(NEWSLETTER_CONFIRMATION_ALREADY_SUBSCRIBED_URL || '/');
            }
            return res.redirect(NEWSLETTER_CONFIRMATION_FAILURE_URL || '/');
        }
    }),

    confirmSubscriptionJSON: asyncWrapper(async (req, res) => {
        const { token } = req.body;

        const result = await newsletterService.confirmSubscription(token);
        
        return sendSuccess(res, {
            message: 'Newsletter subscription confirmed successfully',
            subscriber: result
        });
    }),
};

export { newsletterController };
