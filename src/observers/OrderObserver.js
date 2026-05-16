//@ts-check

import BaseObserver from './BaseObserver.js';
import notificationService from '../services/notificationService.js';

/**
 * @typedef {import('./../types/models').Order} Order
 */

/**
 * @extends {BaseObserver<Order>}
 */
export default class OrderObserver extends BaseObserver {
    /**
     * @param {Order} order
     * @param {any} [tx]
     */
    async created(order, tx) {
        // We don't notify on creation because order might be PENDING
    }

    /**
     * Notify user when a free order is completed immediately.
     * 
     * @param {Order} order
     * @param {object} metadata
     * @param {number} metadata.itemsCount
     * @param {string} metadata.eventTitle
     * @param {number} metadata.eventId
     */
    async completed(order, { itemsCount, eventTitle, eventId }) {
        try {
            await notificationService.notifyPurchaseSuccess(
                order.userId,
                eventId,
                order.id,
                eventTitle,
                itemsCount
            );
        } catch (error) {
            console.error(`[OrderObserver] Failed to notify purchase success for order ${order.id}:`, error);
        }
    }
}
