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

class NewsletterController {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    subscribe = asyncWrapper(async (req, res) => {
        const { email, language } = req.body;

        await newsletterService.subscribe(email, language);
        
        return sendSuccess(res, NewsletterSuccess.SUBSCRIBE_SENT);
    });

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    confirmSubscription = asyncWrapper(async (req, res) => {
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
    });
}

export const newsletterController = new NewsletterController();
