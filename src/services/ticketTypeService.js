import { prisma as prismaClient } from './../config/db.js';
import TicketStatus from '../constants/enums/ticketStatus.js';
import { generateQrCode } from '../utils/generateQrCode.js';
import ticketService from './ticketService.js';
import AppError from '../errors/AppError.js';

const ticketTypeService = {
    DEFAULT_EXCLUDE_FIELDS: {
        id: true,
        createdAt: true,
        updatedAt: true,
        eventId: true,
    },

    async createBulkTickets(eventId, ticketTypes, tx = prismaClient) {
        try {
            const ticketTypeData = ticketTypes.map((ticket) => ({
                eventId,
                name: ticket.name,
                price: parseFloat(ticket.price),
                quantity: parseFloat(ticket.quantity),
            }));
            const result = await tx.ticketType.createMany({
                data: ticketTypeData,
            });
            return result;
        } catch (error) {
            throw error;
        }
    },

    async createFreeBulkTickets(eventId, ticketTypes, tx = prismaClient) {
        const ticketTypeData = ticketTypes.map((ticket) => ({
            eventId,
            name: ticket.name || 'Free Ticket',
            price: 0,
            quantity: parseFloat(ticket.quantity) || 100,
        }));
        return await tx.ticketType.createMany({
            data: ticketTypeData,
        });
    },

    async getTotalTickets(eventId) {
        const totalTickets = await prismaClient.ticketType.aggregate({
            where: { eventId },
            _sum: { quantity: true },
        });
        return totalTickets._sum.quantity || 0;
    },

    async getAllTicketTypes(eventId) {
        return prismaClient.ticketType.findMany({
            where: { eventId },
        });
    },

    async deleteTickets(eventId, tx = prismaClient) {
        return tx.ticketType.deleteMany({
            where: { eventId },
        });
    },

    async issueTicketsForOrder(orderId, userId, orderItems, seatMetaData = [], tx = prismaClient) {
        const ticketsToCreate = [];
        const updateStockPromises = [];
        let seatPointer = 0;
        
        for (const item of orderItems) {
            for (let i = 0; i < item.quantity; i++) {
                const newTicket = {
                    userId,
                    ticketTypeId: item.ticketTypeId,
                    orderId,
                    orderItemId: item.id,
                    status: TicketStatus.VALID,
                };

                if (seatMetaData && seatMetaData.length > 0 && seatMetaData[seatPointer]?.eventId) {
                    const currentSeat = seatMetaData[seatPointer];
                    const seat = await tx.eventSeat.findUnique({
                        where: {
                            eventId_rowIndex_seatIndex: {
                                eventId: currentSeat.eventId,
                                rowIndex: currentSeat.rowIndex,
                                seatIndex: currentSeat.seatIndex,
                            },
                        },
                    });

                    if (seat) newTicket.eventSeatId = seat.id;
                    seatPointer++;
                }

                ticketsToCreate.push(newTicket);

            }

            const updatePromise = tx.ticketType.update({
                where: { id: item.ticketTypeId },
                data: { sold: { increment: Number(item.quantity) } },
            });
            updateStockPromises.push(updatePromise);
            
        }

        const [_, tickets] = await Promise.all([
            ...updateStockPromises,
            ticketsToCreate.length > 0
                ? tx.ticket.createMany({ data: ticketsToCreate })
                : Promise.resolve(),
        ]);

        const ticketsCreated = await ticketService.getTicketsCreated({userId, orderItems, tx});

        if (!ticketsCreated || ticketsCreated.length === 0) {
            throw new AppError('Order processed but no tickets created');
        }
        
        await Promise.all(ticketsCreated.map((ticket) => generateQrCode(ticket, tx)));

        return tickets;
    },
};

export default ticketTypeService;
