//@ts-check

import ISMSProvider from './ISMSProvider.js';

/** @typedef {import('./../../../types/shared').SMSData} SMSData */

/** @implements {ISMSProvider} */
export default class MockProvider {
    /**
     * @param {SMSData} data
     * @returns {Promise<any>}
     */
    sendSMS({ to, body }) {
        console.log(`[MOCK SMS] to=${to} body=${body}`);
        return Promise.resolve({ success: true });
    }
}
