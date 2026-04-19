//@ts-check

/** @typedef {import('./../../../types/shared/sms.types').SMSData} SMSData*/
/**
 * @interface ISMSProvider
 */
export default class ISMSProvider {
    /**
     * @param {SMSData} data
     * @returns {Promise<void>}
     * @throws {Error}
     */
    async sendSMS({ to, body }) {
        throw new Error('Method not implemented');
    }
}
