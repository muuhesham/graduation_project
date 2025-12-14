import sanitize from 'sanitize-html';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendFail, sendError } from '../utils/response.js';
import { HOSTNAME, NEWSLETTER_JWT_EXPIRY, NEWSLETTER_JWT_KEY, PORT } from '../config/env.js';
import mailService from '../services/mailService.js';
import { prisma } from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

class NewsletterController {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(this.__filename);

    subscribe = async (req, res) => {
        try {
            const email = sanitize(req.body.email);
            const language = sanitize(req.body.language || 'en');
            if (!email) {
                return sendFail(res, 'Email is required!');
            }
            const token = this.signSubscriptionToken(email, language);
            const confirmationUrl = `http://${HOSTNAME}:${PORT}/api/v1/newsletter/confirm/${token}`;
            await mailService.sendNewsletterConfirmationJob(confirmationUrl, email, language);
            return sendSuccess(res, 'Confirmation email sent!');
        } catch (error) {
            return sendError(res, 'An error occurred while processing your request.');
        }
    };

    addSubscriberIfNotExists = async (email, language) => {
        let newsletterSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });
        if (newsletterSubscriber) return true;
        else
            newsletterSubscriber = await prisma.newsletterSubscriber.create({
                data: {
                    email,
                    languagePreference: language,
                },
            });

        return false;
    };

    signSubscriptionToken = (email, language) => {
        const payload = { email, language };
        const token = jwt.sign(payload, NEWSLETTER_JWT_KEY, {
            expiresIn: NEWSLETTER_JWT_EXPIRY,
        });
        return token;
    };

    confirmSubscription = async (req, res) => {
        try {
            const token = sanitize(req.params.token);
            const decoded = jwt.verify(token, NEWSLETTER_JWT_KEY);
            const { email, language } = decoded;
            if (!token) {
                return res
                    .status(400)
                    .sendFile(path.join(this.__dirname, '../../public/error.html'));
            }
            const existing = await this.addSubscriberIfNotExists(email, language);

            if (existing) {
                return res
                    .status(200)
                    .sendFile(path.join(this.__dirname, '../../public/already-subscribed.html'));
            }

            return res.status(200).sendFile(path.join(this.__dirname, '../../public/success.html'));
        } catch (err) {
            return res.status(400).sendFile(path.join(this.__dirname, '../../public/error.html'));
        }
    };
}

export const newsletterController = new NewsletterController();
