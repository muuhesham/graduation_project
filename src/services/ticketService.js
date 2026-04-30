import { prisma as prismaClient } from './../config/db.js';
import fileService from './fileService.js';
import AppError from '../errors/AppError.js';
import OrderStatus from '../constants/enums/orderStatus.js';

const ticketService = {
    async getSingleTicket({ ticketId, userId }) {
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
                                title: true,
                                bannerPath: true,
                                organizer: {
                                    select: { user: { select: { name: true } } },
                                },
                                eventSessions: { select: { startDate: true, endDate: true } },
                                venue: {
                                    select: {
                                        name: true,
                                        address: true,
                                        city: { select: { name: true } },
                                    },
                                },
                            },
                        },
                    },
                },
                orderItem: {
                    select: {
                        price: true,
                        quantity: true,
                        order: {
                            select: {
                                totalPrice: true,
                            },
                        },
                    },
                },
            },
        });

        if (!ticket) {
            throw new AppError('Ticket not found', 404);
        }

        const bannerAbsUrl = ticket.ticketType?.event?.bannerPath
            ? fileService.getAbsUrl(ticket.ticketType.event.bannerPath)
            : null;

        const event = ticket.ticketType?.event;

        let seat = null;
        if (ticket.eventSeat && (ticket.eventSeat.rowIndex !== null || ticket.eventSeat.seatIndex !== null) ) {
            seat = {
                row: String.fromCharCode(65 + ticket.eventSeat.rowIndex),
                seat: ticket.eventSeat.seatIndex + 1,
                tier: ticket.eventSeat.tier?.name,
            };
        }

        return {
            id: ticket.id,
            title: event?.title,
            bannerUrl: bannerAbsUrl,
            date: event?.eventSessions?.[0]?.startDate || null,
            numberOfTickets: ticket.orderItem?.quantity || 1,
            location: event?.venue
                ? {
                      name: event.venue.name,
                      address: event.venue.address,
                      city: event.venue.city?.name,
                  }
                : null,
            status: ticket.status,
            organizer: event?.organizer?.user?.name || null,
            seat,
            price: ticket.orderItem?.price,
            totalPrice: ticket.orderItem?.order?.totalPrice,
        };
    },

    async getTicketsCreated({ userId, orderItems, tx = prismaClient }) {
        return tx.ticket.findMany({
            where: {
                userId,
                orderItemId: { in: orderItems.map((item) => item.id) },
            },
            include: {
                ticketType: {
                    select: {
                        event: { select: { slug: true } },
                    },
                },
            },
        });
    },

    async getUserTickets({ userId }) {
        const tickets = await prismaClient.ticket.findMany({
            where: {
                userId,
                orderItem: { order: { status: OrderStatus.COMPLETED } },
            },
            select: {
                id: true,
                status: true,
                orderId: true,
                eventSeat: {
                    select: {
                        rowIndex: true,
                        seatIndex: true,
                        tier: { select: { name: true } },
                    },
                },
                ticketType: {
                    select: {
                        name: true,
                        event: {
                            select: {
                                title: true,
                                eventSessions: {
                                    select: { startDate: true, endDate: true },
                                    orderBy: { startDate: 'asc' },
                                    take: 1,
                                },
                                venue: {
                                    select: {
                                        name: true,
                                        address: true,
                                        city: { select: { name: true } },
                                    },
                                },
                                organizer: {
                                    select: { user: { select: { name: true } } },
                                },
                            },
                        },
                    },
                },
                orderItem: {
                    select: {
                        quantity: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const transformedTickets = tickets.map((ticket) => {
            const event = ticket.ticketType?.event;
            const session = event?.eventSessions?.[0];
            const venue = event?.venue;
            const organizer = event?.organizer?.user;
            const eventSeat = ticket.eventSeat;

            let seat = null;
            if (eventSeat?.rowIndex !== null || eventSeat?.seatIndex !== null) {
                const rowLetter = String.fromCharCode(65 + eventSeat.rowIndex);
                const displaySeatNumber = eventSeat.seatIndex + 1;
                seat = {
                    row: rowLetter,
                    seat: displaySeatNumber,
                    tier: eventSeat.tier?.name,
                };
            }

            return {
                id: ticket.id,
                title: event?.title,
                date: session?.startDate ? new Date(session.startDate).toISOString() : null,
                numberOfTickets: ticket.orderItem?.quantity || 1,
                location: venue
                    ? {
                          name: venue.name,
                          address: venue.address,
                          city: venue.city?.name,
                      }
                    : null,
                status: ticket.status,
                organizer: organizer?.name || null,
                seat,
            };
        });

        return transformedTickets;
    },
};

export default ticketService;
