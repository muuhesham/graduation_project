import OrderStatus from '../constants/enums/orderStatus.js';
import { orderRepository } from '../repositories/index.js';
import { prisma as prismaClient } from '../config/db.js';
import notificationService from './notificationService.js';

const orderService = {
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
     * @param {number} params.eventId
     * @param {Date} params.startDate
     * @param {Date} params.endDate
     * @param {TransactionClient} [params.tx]
     */
    async getFinanceSummary({ eventId, startDate, endDate, tx }) {
        const orders = await (tx || prismaClient).order.findMany({
            where: {
                status: OrderStatus.COMPLETED,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                orderItems: {
                    some: { ticketType: { eventId } },
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
     * @param {number} params.eventId
     * @param {TransactionClient} [params.tx]
     */
    async getTicketsSoldByEvent({ eventId, tx }) {
        const result = await (tx || prismaClient).orderItem.aggregate({
            where: { ticketType: { eventId } },
            _sum: { quantity: true },
        });

        return result._sum.quantity || 0;
    },

    /**
     * @param {object} params
     * @param {number} params.eventId
     * @param {TransactionClient} [params.tx]
     */
    async getRevenueByEvent({ eventId, tx }) {
        const orders = await (tx || prismaClient).order.findMany({
            where: {
                status: OrderStatus.COMPLETED,
                orderItems: {
                    some: { ticketType: { eventId } },
                },
            },
            select: { totalPrice: true },
        });

        return orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
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

            await tx.user.update({
                where: { id: order.userId },
                data: { wallet: { increment: eventPrice } },
            });

            await tx.order.update({
                where: { id: order.id },
                data: {
                    status: OrderStatus.REFUNDED,
                    totalPrice: { decrement: eventPrice },
                },
            });

            await tx.ticket.updateMany({
                where: { orderId: order.id, ticketType: { eventId } },
                data: { status: 'expired' },
            });

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
