import { prisma as prismaClient } from './../config/db.js';
import fileService from './fileService.js';
import AppError from '../errors/AppError.js';
import OrderStatus from '../constants/enums/orderStatus.js';

const ticketService = {
    async getSingleTicket(ticketId, userId) {
        const ticket = await prismaClient.ticket.findFirst({
            where: {
                id: ticketId,
                userId,
                orderItem: {
                    order: {
                        status: OrderStatus.COMPLETED,
                    },
                }
            },
            select: {
                ticketType: {
                    select: {
                        event: {
                            select: {
                                title: true,
                                bannerPath: true,
                                type: true,
                                mode: true,
                                category: { select: { name: true } },
                                eventSessions: { select: { startDate: true, endDate: true } },
                                venue: {
                                    select: {
                                        name: true,
                                        address: true,
                                        city: true,
                                        country: true,
                                    },
                                },
                            },
                        },
                    },
                },
                qrCode: { select: { codePath: true } },
                orderItem: {
                    select: {
                        ticketType: {
                            select: {
                                name: true,
                            }
                        },
                        price: true,
                        quantity: true,
                        order: {
                            select: {
                                id: true,
                                status: true,
                                totalPrice: true,
                                itemsCount: true,
                                createdAt: true,
                            },
                        },
                    },
                },
            },
        });

        if (!ticket) {
            throw new AppError('Ticket not found', 404);
        }

        if(ticket?.qrCode?.codePath) {
            ticket.qrCode.qrAbsUrl = fileService.getAbsUrl(ticket.qrCode.codePath);
        }

        if(ticket?.ticketType?.event?.bannerPath) {
            ticket.ticketType.event.bannerAbsUrl = fileService.getAbsUrl(ticket.ticketType.event.bannerPath);
        }

        return ticket;
    },

    async getTicketsCreated(userId, orderItems, tx = prismaClient) {
        return tx.ticket.findMany({
            where: {
                userId,
                orderItemId: {in : orderItems.map( (item) => item.id )},
            },
        });
    },

};

export default ticketService;