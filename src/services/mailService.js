//@ts-check

import otpMailTemplate from '../mails/templates/otpMail.js';
import mailQueue from '../queues/mailQueue.js';
import passwordResetMail from '../mails/templates/passwordResetMail.js';
import newsletterConfirmTemplate from '../mails/templates/newsletterConfirmMail.js';
import { FRONT_URL } from '../config/env.js';
import updateEmailTemplate from '../mails/templates/updateEmailMail.js';
import organizerApprovedMail from '../mails/templates/organizerApprovedMail.js';
import AppError from '../errors/AppError.js';

/** @typedef {(variables: Record<string, any>) => string} MailTemplateFn */

const mailService = {
    /** @type {Map<string, MailTemplateFn>} */
    _templateCache: new Map(),

    /**
     * @param {object} options
     * @param {string} options.to
     * @param {string} options.subject
     * @param {string} options.body
     * @returns {Promise<any>}
     */
    async sendRawMail({ to, subject, body }) {
        return mailQueue.add('sendMail', {
            to,
            subject,
            html: body,
            text: body.replace(/<[^>]*>?/gm, ''), // Simple HTML to text conversion
        });
    },

    /**
     * @param {object} options
     * @param {string} options.to
     * @param {string} options.subject
     * @param {string} options.templateName
     * @param {Record<string, any>} options.variables
     * @returns {Promise<any>}
     */
    async sendQueued({ to, subject, templateName, variables }) {
        const template = await this._getTemplate(templateName);
        const html = template(variables);
        
        return mailQueue.add(
            'sendMail',
            {
                to,
                subject,
                html,
                text: variables.plainText || '',
            },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
    },

    /**
     * @private
     * @param {string} templateName
     * @returns {Promise<MailTemplateFn>}
     */
    async _getTemplate(templateName) {
        const name = String(templateName || '').trim();
        const cached = this._templateCache.get(name);
        if (cached) return cached;

        const fn = await this._loadTemplate(name);
        this._templateCache.set(name, fn);
        return fn;
    },

    /**
     * @private
     * @param {string} templateName
     * @returns {Promise<MailTemplateFn>}
     */
    async _loadTemplate(templateName) {
        try {
            if (!/^[a-zA-Z0-9_-]+$/.test(templateName)) {
                throw new AppError('Unsupported Mail template', 500, 'MAIL_TEMPLATE_UNKNOWN');
            }

            const mod = await import(
                new URL(`../mails/templates/${templateName}.js`, import.meta.url).href
            );
            const fn = mod?.default;

            if (typeof fn !== 'function') {
                throw new AppError('Invalid Mail template module', 500, 'MAIL_TEMPLATE_INVALID');
            }

            return fn;
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(`Unsupported Mail template: ${templateName}`, 500, 'MAIL_TEMPLATE_UNKNOWN');
        }
    },

    // OLD METHODS (Retained for gradual migration)
    async sendOtpJob(user, otp, expiresIn) {
        const expiresInMinutes = Math.floor(expiresIn / 60);
        const html = otpMailTemplate({ name: user.name, otp, expiresInMinutes });

        await mailQueue.add(
            'sendOtpMail',
            {
                to: user.email,
                subject: 'Your Verification Code',
                html,
                text: `Your verification code is: ${otp}. This code will expire in ${expiresIn / 60} minutes.`,
            },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
    },

    async sendPasswordResetJob(user, resetUrl, expiresIn) {
        const expiresInMinutes = Math.floor(expiresIn / 60);
        const html = passwordResetMail({ name: user.name, resetUrl, expiresInMinutes });

        await mailQueue.add(
            'sendPasswordResetMail',
            {
                to: user.email,
                subject: 'Reset Your Password',
                html,
                text: `You requested to reset your password.\n\nClick this link: ${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
            },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
    },

    async sendNewsletterConfirmationJob(confirmationUrl, email, language = 'en') {
        const html = newsletterConfirmTemplate(confirmationUrl, language);
        if (language === 'en')
            await mailQueue.add(
                'sendNewsletterConfirmationMail',
                {
                    to: email,
                    subject: 'Confirm Your Subscription',
                    html,
                    text: `Please confirm your subscription by clicking the link: ${confirmationUrl}`,
                },
                {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 5000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                }
            );
        else if (language === 'ar')
            await mailQueue.add(
                'sendNewsletterConfirmationMail',
                {
                    to: email,
                    subject: 'تأكيد اشتراكك',
                    html,
                    text: `يرجى تأكيد اشتراكك بالنقر على الرابط: ${confirmationUrl}`,
                },
                {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 5000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                }
            );
    },
    async sendUpdateEmail({ user, newEmail, token }) {
        const html = updateEmailTemplate({
            name: user.name,
            newEmail: newEmail,
            confirmUrl: `${FRONT_URL}/confirm-email?token=${token}`,
        });
        await mailQueue.add(
            'sendUpdateEmail',
            {
                to: user.email,
                subject: 'Confirm your new email address',
                html: html,
                text: `You requested to change your email to ${newEmail}.\n\nPlease confirm this change by clicking the link: ${FRONT_URL}/confirm-email?token=${token}\n\nIf you didn't request this, please ignore this email.`,
            },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
    },

    async sendOrganizerApprovedJob(organizer) {
        const html = organizerApprovedMail({
            name: organizer.name || 'Organizer',
            dashboardUrl: `${FRONT_URL}/organizer/dashboard`,
        });

        await mailQueue.add(
            'sendOrganizerApprovedMail',
            {
                to: organizer.contactEmail,
                subject: 'Your Organizer Profile has been Approved!',
                html,
                text: `Congratulations! Your organizer profile has been approved. You can now access your dashboard at: ${FRONT_URL}/organizer/dashboard`,
            },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
    },
};

export default mailService;
