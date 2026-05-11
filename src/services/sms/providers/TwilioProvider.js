//@ts-check

import ISMSProvider from './ISMSProvider.js';

/** @typedef {typeof import('../../../config/twilio').default} TwilioClient */
/** @typedef {import('../../../types/shared').SMSData} SMSData */

/** @implements {ISMSProvider} */
export default class TwilioProvider {
    /** @type {TwilioClient} */
    #client;

    /** @param {TwilioClient} client */
    constructor(client) {
        this.#client = client;
    }

    /**
     * @param {SMSData} data
     * @returns {Promise<any>}
     */
    sendSMS({ to, body }) {
        return this.#client.messages.create({ to, body });
    }
}
