//@ts-check

import ISMSProvider from './ISMSProvider.js';

/** @typedef {import('../../../types/sms.types.js').SMSData} SMSData */

/**
 * @implements {ISMSProvider}
 */
class MockProvider {
    /**
     * @param {SMSData} data
     * @returns {Promise<any>}
     */
    sendSMS({ to, body }) {
        console.log(`[MOCK SMS] to=${to} body=${body}`);
        return Promise.resolve({ success: true });
    }
}

export default new MockProvider();
