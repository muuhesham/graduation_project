import Twilio from 'twilio';

import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from './env.js';

/**
 * @typedef {Object} TwilioMessageCreateData
 * @property {string} to
 * @property {string} body
 */

/**
 * @typedef {Object} TwilioClient
 * @property {{ create: (data: TwilioMessageCreateData) => Promise<any> }} messages
 */

const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/** @type {TwilioClient} */
const twilioClient = {
    messages: {
        create: (data) =>
            client.messages.create({
                from: TWILIO_PHONE_NUMBER,
                ...data,
            }),
    },
};

export default twilioClient;
