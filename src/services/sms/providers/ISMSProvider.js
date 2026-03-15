//@ts-check

/** @typedef {import('../../../types/sms.types.js').SMSData} SMSData */

/**
 * @interface
 */
export default class ISMSProvider {
    /**
     * Send an SMS
     * @param {SMSData} data
     * @returns {Promise<any>}
     */
    sendSMS(data) {
        throw new Error('Method not implemented');
    }
}
