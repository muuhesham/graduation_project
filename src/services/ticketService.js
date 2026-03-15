import { prisma as prismaClient } from './../config/db.js';
import fileService from './fileService.js';
import AppError from '../errors/AppError.js';
import OrderStatus from '../constants/enums/orderStatus.js';

const ticketService = {
    async getSingleTicket({ticketId, userId}) {
        const ticket = await prismaClient.ticket.findFirst({
            where: {
                id: ticketId,
                userId,
                orderItem: { order: { status: OrderStatus.COMPLETED } },
            },
            select: {
                id: true,
                status: true,
                eventSeat: {
                    select: { rowIndex: true, seatIndex: true, tier: { select: { name: true } } },
                },
                ticketType: {
                    select: {
                        event: {
                            select: {
                                organizerId:true,
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
                qrCode: { select: { codePath: true, status: true } },
                orderItem: {
                    select: {
                        price: true,
                        quantity: true,
                        ticketType: { select: { name: true } },
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

        if (ticket?.qrCode?.codePath) {
            ticket.qrCode.qrAbsUrl = fileService.getAbsUrl(ticket.qrCode.codePath);
        }

        if (ticket?.ticketType?.event?.bannerPath) {
            ticket.ticketType.event.bannerAbsUrl = fileService.getAbsUrl(ticket.ticketType.event.bannerPath);
        }

        if (ticket.eventSeat?.rowIndex || ticket.eventSeat?.seatIndex) {
            const rowLetter = String.fromCharCode(65 + ticket.eventSeat.rowIndex);
            const displaySeatNumber = ticket.eventSeat.seatIndex + 1;
            ticket.eventSeat.rowLabel = rowLetter;
            ticket.eventSeat.seatLabel = displaySeatNumber;
        }

        return ticket;
    },

    async getTicketsCreated({userId, orderItems, tx = prismaClient}) {
        return tx.ticket.findMany({
            where: {
                userId,
                orderItemId: { in: orderItems.map((item) => item.id) },
            },
            include:{
                ticketType: {
                    select: {
                        event: { select : { slug: true } }
                    }
                }
            }
        });
    },

    async getUserTickets({userId}) {
        const tickets = await prismaClient.ticket.findMany({
            where: {
                userId,
                orderItem: { order: { status: OrderStatus.COMPLETED } },
            },
            select: {
                id: true,
                status: true,
                orderId: true,
                eventSeat: { select: {rowIndex: true, seatIndex: true, tier: { select: { name: true } } } },
                ticketType: { select: { event: { select: { title: true, bannerPath: true } } } },
                qrCode: { select: { codePath: true, status: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const ticketsWithAbsQr = await Promise.all(
            tickets.map(async (ticket) => {
                if (ticket.qrCode?.codePath) {
                    ticket.qrCode.qrAbsUrl = fileService.getAbsUrl(ticket.qrCode.codePath);
                }
                if (ticket.ticketType?.event?.bannerPath) {
                    ticket.ticketType.event.bannerAbsUrl = fileService.getAbsUrl(ticket.ticketType.event.bannerPath);
                }
                if (ticket.eventSeat?.rowIndex || ticket.eventSeat?.seatIndex) {
                    const rowLetter = String.fromCharCode(65 + ticket.eventSeat.rowIndex);
                    const displaySeatNumber = ticket.eventSeat.seatIndex + 1;
                    ticket.eventSeat.rowLabel = rowLetter; 
                    ticket.eventSeat.seatLabel = displaySeatNumber; 
                }
                return ticket;
            })
        );
        return ticketsWithAbsQr;
    },

};

export default ticketService;
