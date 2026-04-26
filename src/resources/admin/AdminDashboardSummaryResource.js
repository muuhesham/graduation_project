//@ts-check

import BaseResource from './../BaseResource.js';

/**
 * @typedef {import('./../../types/models').AdminDashboardSummaryResourceData} Data
 */

/**
 * @extends {BaseResource<any, Data>}
 */
export default class AdminDashboardSummaryResource extends BaseResource {
    /**
     * @param {any} result
     * @returns {Data}
     */
    static toArray(result) {
        return {
            users: {
                total: Number(result?.users?.total ?? 0),
                deleted: Number(result?.users?.deleted ?? 0),
                activeInPeriod: Number(result?.users?.activeInPeriod ?? 0),
            },
            organizers: {
                total: Number(result?.organizers?.total ?? 0),
                pendingReview: Number(result?.organizers?.pendingReview ?? 0),
            },
            events: {
                total: Number(result?.events?.total ?? 0),
            },
            orders: {
                total: Number(result?.orders?.total ?? 0),
                completed: Number(result?.orders?.completed ?? 0),
                pending: Number(result?.orders?.pending ?? 0),
                cancelled: Number(result?.orders?.cancelled ?? 0),
                revenue: Number(result?.orders?.revenue ?? 0),
            },
        };
    }
}
