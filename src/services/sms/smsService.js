//@ts-check

import SMSFactory from './SMSFactory.js';
import smsQueue from './../../queues/smsQueue.js';
import AppError from '../../errors/AppError.js';

/**
 * @typedef {import('./../../types/sms.types.js').SMSData} SMSData
 * @typedef {import('./../../types/sms.types.js').SMSTemplateData} SMSTemplateData
 * @typedef {import('./providers/ISMSProvider.js').default} ISMSProvider
 */

/** @typedef {(variables: Record<string, unknown>) => string} SMSTemplateFn */

class SMSService {
    /** @type {ISMSProvider} */
    #provider;

    /** @type {Map<string, SMSTemplateFn>} */
    #templateCache = new Map();

    constructor() {
        this.#provider = SMSFactory.create();
    }

    /**
     * @param {SMSData} data
     */
    sendRawMessage({ to, body }) {
        return this.#provider.sendSMS({ to, body });
    }

    /**
     * @param {SMSData} data
     * @returns {Promise<any>}
     */
    sendQueuedMessage({ to, body }) {
        return smsQueue.add('sendSMS', { to, body });
    }

    /**
     * @param {{ to: string, templateName: string, variables: Record<string, unknown> }} input
     */
    async sendQueuedTemplate({ to, templateName, variables }) {
        const template = await this.#getTemplate(templateName);
        const body = template(variables);
        return this.sendQueuedMessage({ to, body });
    }

    /**
     * @param {string} templateName
     * @returns {Promise<SMSTemplateFn>}
     */
    async #getTemplate(templateName) {
        const name = String(templateName || '').trim();
        const cached = this.#templateCache.get(name);
        if (cached) return cached;

        const fn = await this.#loadTemplate(name);
        this.#templateCache.set(name, fn);
        return fn;
    }

    /**
     * @param {string} templateName
     * @returns {Promise<SMSTemplateFn>}
     */
    async #loadTemplate(templateName) {
        try {
            if (!/^[a-zA-Z0-9_-]+$/.test(templateName)) {
                throw new AppError('Unsupported SMS template', 500, 'SMS_TEMPLATE_UNKNOWN');
            }

            const mod = await import(
                new URL(`../../sms/templates/${templateName}.js`, import.meta.url).href
            );
            const fn = mod?.default;

            if (typeof fn !== 'function') {
                throw new AppError('Invalid SMS template module', 500, 'SMS_TEMPLATE_INVALID');
            }

            return fn;
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError('Unsupported SMS template', 500, 'SMS_TEMPLATE_UNKNOWN');
        }
    }
}

export default new SMSService();
