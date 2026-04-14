//@ts-check

import { SMS_PROVIDER } from './../config/env.js';
import twilioClient from './../config/twilio.js';

import smsProviders from './../constants/enums/smsProviders.js';

import ISMSProvider from './../services/sms/providers/ISMSProvider.js';
import MockProvider from './../services/sms/providers/MockProvider.js';
import TwilioProvider from './../services/sms/providers/TwilioProvider.js';

class SMSFactory {
    /**
     * @param {string} type
     * @returns {ISMSProvider}
     */
    static createInstance(type) {
        switch (type) {
            case smsProviders.TWILIO:
                return new TwilioProvider(twilioClient);
            case smsProviders.MOCK:
                return new MockProvider();
            default:
                throw new Error(`Unsupported SMS provider: ${type}`);
        }
    }
}

export default new SMSFactory();
export { SMSFactory };
