import OrderStatus from '../constants/enums/orderStatus.js';
import { orderRepository } from '../repositories/index.js';
import { prisma as prismaClient } from '../config/db.js';
import notificationService from './notificationService.js';
import { PrismaQueryBuilder } from '../utils/queryBulider.js';

/**
 * @typedef {import('./../types/shared').TransactionClient} TransactionClient
 */

const orderService = {
    MAX_LIMIT: 100,
    DEFAULT_SELECTIONS: {
        id: true,
        userId: true,
        totalPrice: true,
        itemsCount: true,
        status: true,
        createdAt: true,
    },

    DEFAULT_EXCLUDE_FIELDS: {
        updatedAt: true,
    },

    DEFAULT_RELATIONS: {
        orderItems: true,
    },

    ALLOWED_RELATIONS: ['user', 'orderItems'],

    /**
     * @param {string} userId
     * @param {number} totalPrice
     * @param {number} itemsCount
     * @param {string} status
     * @param {object} options
     * @param {TransactionClient} [tx]
     */
    async create(
        userId,
        totalPrice,
        itemsCount,
        status = OrderStatus.PENDING,
        { selections, relations, exclude, filters } = {},
        tx = prismaClient
    ) {
        const query = new PrismaQueryBuilder({
            allowedRelations: orderService.ALLOWED_RELATIONS,
            maxLimit: orderService.MAX_LIMIT,
        })
            .select(selections || orderService.DEFAULT_SELECTIONS)
            .include(relations || orderService.DEFAULT_RELATIONS)
            .omit(exclude || orderService.DEFAULT_EXCLUDE_FIELDS)
            .where(filters || {}).value;

        return (tx || prismaClient).order.create({
            data: {
                userId,
                totalPrice,
                status,
                itemsCount,
            },
            ...query,
        });
    },

    /**
     * @param {string} id
     * @param {object} options
     * @param {TransactionClient} [tx]
     */
    async findById(id, { selections, relations, exclude, filters } = {}, tx = prismaClient) {
        const query = new PrismaQueryBuilder({
            allowedRelations: orderService.ALLOWED_RELATIONS,
            maxLimit: orderService.MAX_LIMIT,
        })
            .select(selections || orderService.DEFAULT_SELECTIONS)
            .include(relations || orderService.DEFAULT_RELATIONS)
            .omit(exclude || orderService.DEFAULT_EXCLUDE_FIELDS)
            .where({ id, ...filters }).value;

        return (tx || prismaClient).order.findFirst(query);
    },

    /**
     * @param {string} id
     * @param {TransactionClient} [tx]
     */
    async delete(id, tx = prismaClient) {
        return (tx || prismaClient).order.delete({
            where: { id },
        });
    },

    /**
     * @param {string} userId
     * @param {object} options
     */
    async getUserOrders(
        userId,
        { selections, relations, exclude, filters, pagination, sort } = {}
    ) {
        const query = new PrismaQueryBuilder({
            allowedRelations: orderService.ALLOWED_RELATIONS,
            maxLimit: orderService.MAX_LIMIT,
        })
            .select(selections || orderService.DEFAULT_SELECTIONS)
            .include(relations || orderService.DEFAULT_RELATIONS)
            .omit(exclude || orderService.DEFAULT_EXCLUDE_FIELDS)
            .where({ userId, ...filters })
            .paginate(pagination?.page, pagination?.limit)
            .sort(sort).value;

        return prismaClient.order.findMany(query);
    },

    /**
     * @param {string} orderId
     * @param {string} status
     * @param {TransactionClient} [tx]
     */
    async updateOrderStatus(orderId, status, tx = prismaClient) {
        return (tx || prismaClient).order.update({
            where: { id: orderId },
            data: { status },
        });
    },

    /**
     * @param {string} id
     * @param {string} userId
     */
    async status(id, userId) {
        const relations = {};
        const selections = {
            status: true,
        };

        return await orderService.findById(id, {
            selections,
            relations,
            filters: { userId },
        });
    },

    /**
     * @param {string} id
     * @param {object[]} items
     * @param {TransactionClient} [tx]
     */
    async createOrderItemsBulk(id, items, tx = prismaClient) {
        await (tx || prismaClient).orderItem.createMany({
            data: items.map((item) => ({
                orderId: id,
                ticketTypeId: item.ticketTypeId,
                price: parseFloat(item.price),
                quantity: item.quantity,
            })),
        });

        return (tx || prismaClient).orderItem.findMany({
            where: { orderId: id }
        });
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

    async ticketsSoldByEvent(eventId) {
        return this.getTicketsSoldByEvent({ eventId });
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

    async revenueByEvent(eventId) {
        return this.getRevenueByEvent({ eventId });
    },

    async countByStatus(status) {
        return orderRepository.countByStatus(status);
    },

    async countAllOrders() {
        return orderRepository.countAllOrders();
    },

    async revenueByStatus(status) {
        return orderRepository.revenueByStatus(status);
    },

    async totalByEvent(eventId) {
        return orderRepository.totalByEvent(eventId);
    },

    async countByEventAndStatus(eventId, status) {
        return orderRepository.countByEventAndStatus(eventId, status);
    },

    async countIssuedTicketsByEvent(eventId) {
        return orderRepository.countIssuedTicketsByEvent(eventId);
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
     * @param {{ since: Date }} options
     */
    async getPendingPayoutOrders({ since }) {
        return orderRepository.getPendingPayoutOrders(since);
    },

    /**
     * @param {Date} since
     * @param {number} payoutId
     * @param {TransactionClient} tx
     */
    async markOrdersAsPaid(since, payoutId, tx) {
        return tx.order.updateMany({
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

    async getOrderTickets({ orderId, userId }) {
        const order = await prismaClient.order.findFirst({
            where: { userId, id: orderId, status: OrderStatus.COMPLETED },
            select: {
                totalPrice: true,
                itemsCount: true,
                status: true,
                user: { select: { name: true, email: true } },
                orderItems: {
                    include: {
                        ticketType: {
                            select: {
                                name: true,
                                price: true,
                                event: { select: { title: true, organizerId: true } },
                            },
                        },
                    },
                },
                tickets: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        status: true,
                        eventSeat: {
                            select: {
                                rowIndex: true,
                                seatIndex: true,
                                tier: { select: { name: true } },
                            },
                        },
                        orderItem: {
                            select: {
                                quantity: true,
                                ticketType: {
                                    select: {
                                        name: true,
                                        price: true,
                                        event: { select: { title: true, organizerId: true } },
                                    },
                                },
                            },
                        },
                        qrCode: { select: { codePath: true, status: true } },
                    },
                },
            },
        });

        if (!order) {
            throw new AppError('Order not found or not completed', 404);
        }

        const ticketsWithQrCodes = await Promise.all(
            order.tickets.map(async (ticket) => {
                if (ticket.qrCode?.codePath) {
                    ticket.qrCode.qrAbsUrl = fileService.getAbsUrl(ticket.qrCode.codePath);
                }
                if (ticket.eventSeat?.rowIndex != null && ticket.eventSeat?.seatIndex != null) {
                    const rowLetter = String.fromCharCode(65 + ticket.eventSeat.rowIndex);
                    const displaySeatNumber = ticket.eventSeat.seatIndex + 1;
                    ticket.eventSeat.rowLabel = rowLetter;
                    ticket.eventSeat.seatLabel = displaySeatNumber;
                }
                return ticket;
            })
        );

        return {
            totalPrice: order.totalPrice,
            itemsCount: order.itemsCount,
            user: order.user,
            ticketType: order.orderItems,
            tickets: ticketsWithQrCodes,
        };
    },

    /**
     * Notify observers for an order.
     * 
     * @param {string} event
     * @param {object} order
     * @param {object} metadata
     */
    notify(event, order, metadata) {
        return orderRepository.notify(event, order, metadata);
    }
};

export default orderService;
