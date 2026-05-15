import OrderStatus from '../constants/enums/orderStatus.js';
import { orderRepository } from '../repositories/index.js';
import { prisma as prismaClient } from '../config/db.js';
import notificationService from './notificationService.js';

const orderService = {
    /**
     * @param {string} userId
     * @param {number} totalPrice
     * @param {number} itemsCount
     * @param {string} status
     * @param {object} options
     * @param {TransactionClient} [tx]
     */
    async create(userId, totalPrice, itemsCount, status, options, tx) {
        return orderRepository.create(
            {
                userId,
                totalPrice,
                itemsCount,
                status,
            },
            tx
        );
    },

    /**
     * @param {string} orderId
     * @param {any[]} items
     * @param {TransactionClient} [tx]
     */
    async createOrderItemsBulk(orderId, items, tx) {
        const createPromises = items.map((item) =>
            (tx || prismaClient).orderItem.create({
                data: {
                    orderId,
                    ticketTypeId: item.ticketTypeId,
                    price: item.price,
                    quantity: item.quantity,
                },
            })
        );
        return Promise.all(createPromises);
    },

    /**
     * @param {string} orderId
     * @param {string} status
     * @param {TransactionClient} [tx]
     */
    async updateOrderStatus(orderId, status, tx) {
        return orderRepository.update(
            {
                where: { id: orderId },
                data: { status },
            },
            tx
        );
    },

    /**
     * @param {string} orderId
     * @param {string} userId
     */
    async status(orderId, userId) {
        const order = await orderRepository.findUnique({
            where: { id: orderId, userId },
            select: { status: true },
        });
        return order?.status;
    },

    /**
     * @param {object} params
     * @param {string} params.orderId
     * @param {string} params.userId
     */
    async getOrderTickets({ orderId, userId }) {
        const order = await orderRepository.findUnique({
            where: { id: orderId, userId },
            include: {
                tickets: {
                    include: {
                        ticketType: true,
                        qrCode: true,
                    },
                },
            },
        });
        return order?.tickets || [];
    },

    /**
     * @returns {Promise<number>}
     */
    async countAllOrders() {
        return orderRepository.countAllOrders();
    },

    /**
     * @param {string} status
     * @returns {Promise<number>}
     */
    async countByStatus(status) {
        return orderRepository.countByStatus(status);
    },

    /**
     * @param {string} status
     * @returns {Promise<number>}
     */
    async revenueByStatus(status) {
        return orderRepository.revenueByStatus(status);
    },

    /**
     * @param {object} params
     * @param {Date} params.since
     */
    async getPendingPayoutOrders({ since }) {
        return orderRepository.getPendingPayoutOrders(since);
    },

    /**
     * @param {Date} since
     * @param {number} payoutId
     * @param {TransactionClient} [tx]
     */
    async markOrdersAsPaid(since, payoutId, tx) {
        return (tx || prismaClient).order.updateMany({
            where: {
                status: OrderStatus.COMPLETED,
                createdAt: { gte: since },
                isPaidOut: false,
            },
            data: {
                isPaidOut: true,
                payoutId: payoutId,
            },
        });
    },

    /**
     * @param {number} eventId
     */
    async ticketsSoldByEvent(eventId) {
        const result = await (prismaClient).orderItem.aggregate({
            where: { ticketType: { eventId } },
            _sum: { quantity: true },
        });

        return result._sum.quantity || 0;
    },

    /**
     * @param {number} eventId
     */
    async revenueByEvent(eventId) {
        return orderRepository.revenueByEvent(eventId);
    },

    /**
     * @param {number} eventId
     * @param {string} status
     */
    async countByEventAndStatus(eventId, status) {
        return orderRepository.countByEventAndStatus(eventId, status);
    },

    /**
     * @param {number} eventId
     */
    async countIssuedTicketsByEvent(eventId) {
        return orderRepository.countIssuedTicketsByEvent(eventId);
    },

    /**
     * @param {string} orderId
     * @param {TransactionClient} [tx]
     */
    async findById(orderId, tx) {
        return orderRepository.findUnique({ where: { id: orderId } }, tx);
    },

    /**
     * @param {string} userId
     * @param {object} pagination
     */
    async listUserOrders(userId, pagination) {
        return orderRepository.list({
            where: { userId },
            pagination,
            include: { orderItems: { include: { ticketType: true } } },
        });
    },

    /**
     * @param {string} userId
     * @param {string} orderId
     */
    async getUserOrderDetails(userId, orderId) {
        return orderRepository.findUnique({
            where: { id: orderId, userId },
            include: { orderItems: { include: { ticketType: true } } },
        });
    },


    /**
     * @param {object} params
     * @param {Date} params.startDate
     * @param {Date} params.endDate
     * @param {TransactionClient} [params.tx]
     */
    async getPlatformFinanceSummary({ startDate, endDate, tx }) {
        const orders = await (tx || prismaClient).order.findMany({
            where: {
                status: OrderStatus.COMPLETED,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { totalPrice: true },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
        const totalOrders = orders.length;

        return { totalRevenue, totalOrders };
    },

    /**
     * @param {object} params
     * @param {Date} params.startDate
     * @param {Date} params.endDate
     * @param {TransactionClient} [params.tx]
     */
    async getCompletedOrdersInRange({ startDate, endDate, tx }) {
        return (tx || prismaClient).order.findMany({
            where: {
                status: OrderStatus.COMPLETED,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
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
    },

    /**
     * @param {number[]} orderIds
     * @param {number} payoutId
     * @param {TransactionClient} tx
     */
    async markOrdersAsPaidOut(orderIds, payoutId, tx) {
        return tx.order.updateMany({
            where: {
                id: { in: orderIds },
                status: OrderStatus.COMPLETED,
                isPaidOut: false,
            },
            data: {
                isPaidOut: true,
                payoutId: payoutId,
            },
        });
    },

    /**
     * @param {{ eventId: number, tx: TransactionClient }} params
     * @returns {Promise<void>}
     */
    async refundOrders({ eventId, tx }) {
        const orders = await tx.order.findMany({
            where: {
                status: OrderStatus.COMPLETED,
                orderItems: {
                    some: { ticketType: { eventId } },
                },
            },
            include: {
                orderItems: { include: { ticketType: { include: { event: true } } } },
                user: true,
            },
        });

        if (orders.length === 0) return;

        for (const order of orders) {
            const eventPrice = order.orderItems
                .filter((item) => item.ticketType.eventId === eventId)
                .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

            await Promise.all(
            tx.user.update({
                where: { id: order.userId },
                data: { wallet: { increment: eventPrice } },
            }),
            tx.order.update({
                 where: { id: order.id },
                 data: {
                     status: OrderStatus.REFUNDED,
                     totalPrice: { decrement: eventPrice },
                 },
             }),
             tx.ticket.updateMany({
                 where: { orderId: order.id, ticketType: { eventId } },
                 data: { status: 'expired' },
             }),
            );

            if (order.orderItems.length > 0) {
                const eventTitle = order.orderItems[0].ticketType.event.title;
                await notificationService.notifyRefundProcessed(
                    order.userId,
                    eventTitle,
                    eventPrice,
                    order.id
                );
            }
        }
    },
};

export default orderService;
