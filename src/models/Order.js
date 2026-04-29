//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast, booleanCast } from './casts.js';
import OrderItem from './OrderItem.js';

/** @typedef {import('./contracts/ICastableModel.js').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models/order.model.js').OrderData} OrderDataType */
/** @typedef {import('./../types/models/order.model.js').Order} OrderWithRelations */

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
     * @param {Array<{ grossAmount: number, ordersCount: number }>} payouts
     */
    static payoutTotals(payouts) {
        const grossAmount = payouts.reduce((acc, item) => acc + item.grossAmount, 0);
        const orders = payouts.reduce((acc, item) => acc + item.ordersCount, 0);

        return {
            organizers: payouts.length,
            orders,
            grossAmount: Number(grossAmount.toFixed(2)),
        };
    }

    /**
     * @param {OrderWithRelations[]} orders
     * @returns {import('./../repositories/OrderRepository.js').PayoutSummaryRow[]}
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
            .map((org) => ({
                organizerId: org.organizerId,
                organizerName: org.organizerName,
                organizerEmail: org.organizerEmail,
                grossAmount: Number(org.grossAmount.toFixed(2)),
                ordersCount: org.uniqueOrders.size,
                ticketsSold: org.ticketsSold,
            }))
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
