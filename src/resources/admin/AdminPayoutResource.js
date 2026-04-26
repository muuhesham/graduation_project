//@ts-check

import BaseResource from './../BaseResource.js';

/**
 * @typedef {import('./../../types/models').AdminPayoutResourceData} Data
 */

/**
 * @extends {BaseResource<any, Data>}
 */
export default class AdminPayoutResource extends BaseResource {
    /**
     * @param {any} result
     * @returns {Data}
     */
    static toArray(result) {
        return {
            id: result.id ?? null,
            processedBy: Number(result?.processedBy ?? 0),
            processedAt: result?.processedAt ?? new Date().toISOString(),
            window: {
                days: Number(result?.window?.days ?? 30),
                from: result?.window?.from ?? '',
                to: result?.window?.to ?? '',
            },
            totals: {
                organizers: Number(result?.totals?.organizers ?? 0),
                orders: Number(result?.totals?.orders ?? 0),
                grossAmount: Number(result?.totals?.grossAmount ?? 0),
            },
            payouts: Array.isArray(result?.payouts) ? result.payouts : [],
        };
    }
}
