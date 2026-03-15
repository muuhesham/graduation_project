import twilioProvider from './providers/TwilioProvider.js';
import mockProvider from './providers/MockProvider.js';
import { SMS_PROVIDER } from './../../config/env.js';

export default class SMSFactory {
    /**
     * @param {string} [providerName]
     */
    static create(providerName = SMS_PROVIDER || 'mock') {
        const providers = {
            twilio: twilioProvider,
            mock: mockProvider,
        };

        const provider = providers[providerName];

        if (!provider) {
            throw new Error(`Unsupported SMS provider: ${providerName}`);
        }

        return provider;
    }
}
