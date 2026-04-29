//@ts-check

import BaseResource from './../BaseResource.js';

/**
 * @typedef {import('./../../types/models').AdminPayoutResourceData} Data
 */

/**
 * @extends {BaseResource}
 */
export default class AdminPayoutResource extends BaseResource {
    /**
     * @param {any} result
     * @returns {Data | null}
     */
    static make(result) {
        return super.make(result);
    }

    /**
     * @param {any} result
     * @returns {Data}
     */
    static toArray(result) {
        return {
            id: result.id ?? null,
            processedBy: Number(result?.adminId ?? result?.processedBy ?? 0),
            processedAt: result?.createdAt?.toISOString() ?? result?.processedAt ?? new Date().toISOString(),
            window: {
                days: Number(result?.window?.days ?? 0),
                from: result?.startDate?.toISOString() ?? result?.window?.from ?? '',
                to: result?.endDate?.toISOString() ?? result?.window?.to ?? '',
            },
            totals: {
                organizers: Number(result?.organizerCount ?? result?.totals?.organizers ?? 0),
                orders: Number(result?.orderCount ?? result?.totals?.orders ?? 0),
                grossAmount: Number(result?.amount ?? result?.totals?.grossAmount ?? 0),
            },
            payouts: Array.isArray(result?.payouts) ? result.payouts : (Array.isArray(result?.items) ? result.items : []),
        };
    }

    /**
     * @param {any[]} items
     * @returns {Data[]}
     */
    static collection(items) {
        return super.collection(items);
    }

    /**
     * @param {any} result
     * @param {string} [dataKey]
     * @returns {any}
     */
    static paginate(result, dataKey = 'payouts') {
        return super.paginate(result, dataKey);
    }
}
