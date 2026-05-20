//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast, booleanCast } from './casts.js';
import OrderItem from './OrderItem.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models').OrderData} OrderDataType */
/** @typedef {import('./../types/models').Order} OrderWithRelations */

/**
 * @extends {BaseModel<OrderDataType>}
 */
class Order extends BaseModel {
    /** @param {OrderDataType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'order';
    }

    /**
     * Platform fee percentage taken by the system.
     * @type {number}
     */
    static PLATFORM_FEE_PERCENT = 0.10;

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'totalPrice', cast: numberCast },
            { field: 'itemsCount', cast: numberCast },
            { field: 'payoutId', cast: numberCast },
            { field: 'isPaidOut', cast: booleanCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    /**
     * @returns {Record<string, any>}
     */
    static get relations() {
        return {
            orderItems: [OrderItem],
        };
    }

    /**
     * @param {number} days
     */
    static payoutWindow(days) {
        const to = new Date();
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

        return {
            days,
            from,
            to,
        };
    }

    /**
     * @param {Array<{ grossAmount: number, platformFee: number, netAmount: number, ordersCount: number }>} payouts
     */
    static payoutTotals(payouts) {
        const grossAmount = payouts.reduce((acc, item) => acc + item.grossAmount, 0);
        const platformFee = payouts.reduce((acc, item) => acc + item.platformFee, 0);
        const netAmount = payouts.reduce((acc, item) => acc + item.netAmount, 0);
        const orders = payouts.reduce((acc, item) => acc + item.ordersCount, 0);

        return {
            organizers: payouts.length,
            orders,
            grossAmount: Number(grossAmount.toFixed(2)),
            platformFee: Number(platformFee.toFixed(2)),
            netAmount: Number(netAmount.toFixed(2)),
        };
    }

    /**
     * @param {OrderWithRelations[]} orders
     * @returns {import('./../repositories/OrderRepository').PayoutSummaryRow[]}
     */
    static computePayouts(orders) {
        /** @type {Map<string, any>} */
        const summaryMap = new Map();

        for (const order of orders) {
            const items = Array.isArray(order.orderItems) ? order.orderItems : [];

            for (const item of items) {
                // @ts-ignore
                const organizer = item.ticketType?.event?.organizer;
                if (!organizer) continue;

                if (!summaryMap.has(organizer.id)) {
                    summaryMap.set(organizer.id, {
                        organizerId: organizer.id,
                        organizerName: organizer.name ?? null,
                        organizerEmail: organizer.contactEmail ?? null,
                        grossAmount: 0,
                        uniqueOrders: new Set(),
                        ticketsSold: 0,
                    });
                }

                const stats = summaryMap.get(organizer.id);
                stats.grossAmount += Number(item.price ?? 0) * (item.quantity ?? 0);
                stats.uniqueOrders.add(order.id);
                stats.ticketsSold += item.quantity ?? 0;
            }
        }

        return Array.from(summaryMap.values())
            .map((org) => {
                const grossAmount = Number(org.grossAmount.toFixed(2));
                const platformFee = Number((grossAmount * Order.PLATFORM_FEE_PERCENT).toFixed(2));
                const netAmount = Number((grossAmount - platformFee).toFixed(2));

                return {
                    organizerId: org.organizerId,
                    organizerName: org.organizerName,
                    organizerEmail: org.organizerEmail,
                    grossAmount,
                    platformFee,
                    netAmount,
                    ordersCount: org.uniqueOrders.size,
                    ticketsSold: org.ticketsSold,
                };
            })
            .sort((a, b) => b.grossAmount - a.grossAmount);
    }

    /**
     * Casts a raw numeric result (like a database sum) into a proper Number.
     * @param {any} value
     * @returns {number}
     */
    static parseAmount(value) {
        return Number(value ?? 0);
    }
}

/** @type {typeof Order & (new (data: OrderDataType) => Order & OrderDataType)} */
const OrderExport = /** @type {any} */ (Order);
export default OrderExport;
