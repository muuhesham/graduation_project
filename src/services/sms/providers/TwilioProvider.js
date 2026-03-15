//@ts-check

import twilioClient from './../../../config/twilio.js';
import ISMSProvider from './ISMSProvider.js';

/** @typedef {typeof import('../../../config/twilio.js').default} TwilioClient */
/** @typedef {import('../../../types/sms.types.js').SMSData} SMSData */

/**
 * @implements {ISMSProvider}
 */
class TwilioProvider {
    /** @type {TwilioClient} */
    #client;

    /**
     * @param {TwilioClient} client
     */
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

export default new TwilioProvider(twilioClient);
