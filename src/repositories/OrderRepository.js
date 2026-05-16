//@ts-check

import BaseRepository from './BaseRepository.js';
import { Order } from './../models/index.js';
import OrderStatus from './../constants/enums/orderStatus.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('./../types/models').Order} OrderType
 * @typedef {import('./../types/models').OrderCreate} OrderCreate
 * @typedef {import('./../types/models').OrderUpdate} OrderUpdate
 * @typedef {import('./../types/models').OrderWhereUnique} OrderWhereUnique
 * @typedef {import('./../types/models').OrderSelect} OrderSelect
 * @typedef {import('./../types/models').OrderInclude} OrderInclude
 */

/**
 * @typedef {object} PayoutSummaryRow
 * @property {string} organizerId
 * @property {string|null} organizerName
 * @property {string|null} organizerEmail
 * @property {number} grossAmount
 * @property {number} ordersCount
 * @property {number} ticketsSold
 */

/**
 * @extends {BaseRepository<OrderType, OrderCreate, OrderUpdate, OrderWhereUnique, OrderSelect, OrderInclude, any>}
 */
export default class OrderRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, Order);
    }

    countAllOrders() {
        return super.count();
    }

    /**
     * @param {OrderStatus} status
     */
    countByStatus(status) {
        return super.count({ where: { status } });
    }

    /**
     * @param {number} eventId
     * @returns {Promise<number>}
     */
    totalByEvent(eventId) {
        return super.count({
            where: {
                orderItems: {
                    some: {
                        ticketType: {
                            eventId,
                        },
                    },
                },
            },
        });
    }

    /**
     * @param {number} eventId
     * @param {OrderStatus} status
     */
    countByEventAndStatus(eventId, status) {
        return super.count({
            where: {
                status,
                orderItems: {
                    some: {
                        ticketType: {
                            eventId,
                        },
                    },
                },
            },
        });
    }

    /**
     * @param {number} eventId
     * @returns {Promise<number>}
     */
    async countIssuedTicketsByEvent(eventId) {
        return this.driver.count('ticket', {
            where: {
                orderItem: {
                    ticketType: {
                        eventId,
                    },
                },
            },
        });
    }

    /**
     * @param {number} eventId
     */
    async revenueByEvent(eventId) {
        /** @type {Array<any>} */
        const ticketTypes = await this.driver.findMany('ticketType', {
            where: { eventId },
            select: {
                orderItems: {
                    where: {
                        order: {
                            status: OrderStatus.COMPLETED,
                        },
                    },
                    select: {
                        price: true,
                        quantity: true,
                    },
                },
            },
        });

        const revenue = ticketTypes.reduce(
            (total, ticketType) =>
                total +
                (ticketType.orderItems || []).reduce(
                    (sum, orderItem) =>
                        sum + Number(orderItem.price ?? 0) * Number(orderItem.quantity ?? 0),
                    0
                ),
            0
        );

        return Number(revenue.toFixed(2));
    }

    /**
     * @param {OrderStatus} status
     */
    async revenueByStatus(status) {
        const result = await super.aggregate({
            where: { status },
            _sum: { totalPrice: true },
        });

        return result._sum?.totalPrice ?? 0;
    }

    /**
     * @param {Date} since
     * @returns {Promise<OrderType[]>}
     */
    async getPendingPayoutOrders(since) {
        return this.findMany({
            where: {
                status: OrderStatus.COMPLETED,
                createdAt: { gte: since },
                isPaidOut: false,
            },
            include: {
                orderItems: {
                    include: {
                        ticketType: {
                            include: {
                                event: {
                                    include: {
                                        organizer: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Public method to manually trigger notifications with specific metadata.
     * @param {string} event 
     * @param {object} order 
     * @param {object} metadata 
     */
    async notify(event, order, metadata) {
        return this._notify(event, order, metadata);
    }
}
