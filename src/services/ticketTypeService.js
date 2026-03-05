import { prisma as prismaClient } from './../config/db.js';
import TicketStatus from '../constants/enums/ticketStatus.js';
import { generateQrCode } from '../utils/generateQrCode.js';
import ticketService from './ticketService.js';

const ticketTypeService = {
    DEFAULT_EXCLUDE_FIELDS: {
        id: true,
        createdAt: true,
        updatedAt: true,
        eventId: true,
    },
    
    //CREATE BULK TICKETS TYPES
    async createBulkTickets(eventId, ticketTypes, tx = prismaClient) {
        const ticketTypeData = ticketTypes.map((ticket) => ({
            eventId,
            name: ticket.name,
            price: parseFloat(ticket.price),
            quantity: ticket.quantity,
        }));
        return tx.ticketType.createManyAndReturn({
            data: ticketTypeData,
        });
    },

    //CREATE FREE BULK TICKET TYPES
    async createFreeBulkTickets(eventId, ticketTypes, tx = prismaClient) {
        const ticketTypeData = ticketTypes.map((ticket) => ({
            eventId,
            name: ticket.name || 'Free Ticket',
            price: 0,
            quantity: ticket.quantity || 100,
        }));
        return tx.ticketType.createManyAndReturn({
            data: ticketTypeData,
        });
    },

    //GET TOTAL NUMBER TICKET TYPES FOR EVENT
    async getTotalTickets(eventId) {
        const totalTickets = await prismaClient.ticketType.aggregate({
            where: { eventId },
            _sum: { quantity: true },
        });
        return totalTickets._sum.quantity || 0;
    },

    // GET ALL TICKET TYPES FOR EVENT
    async getAllTicketTypes(eventId) {
        return prismaClient.ticketType.findMany({
            where: { eventId },
        });
    },

    // DELETE TICKET TYPES FOR EVENT
    async deleteTickets(eventId, tx = prismaClient) {
        return tx.ticketType.deleteMany({
            where: { eventId },
        });
    },

    // CREATE ACTUAL TICKETS FOR ORDER
    async issueTicketsForOrder(orderId, userId, orderItems, tx = prismaClient) {
        const ticketsToCreate = [];
        const updateStockPromises = [];

        for (const item of orderItems) {
            for (let i = 0; i < item.quantity; i++) {
                ticketsToCreate.push({
                    userId,
                    ticketTypeId: item.ticketTypeId,
                    orderId: orderId,
                    orderItemId: item.id,
                    status: TicketStatus.VALID,
                });
            }

            const updatePromise = tx.ticketType.update({
                where: { id: item.ticketTypeId },
                data: { sold: { increment: item.quantity } },
            });
            updateStockPromises.push(updatePromise);
        }

        const [_, tickets] = await Promise.all([
            ...updateStockPromises,
            ticketsToCreate.length > 0
                ? tx.ticket.createMany({ data: ticketsToCreate })
                : Promise.resolve(),
        ]);

        const ticketsCreated = await ticketService.getTicketsCreated(userId, orderItems, tx);

        if (ticketsCreated.length === 0) {
            return {
                status: 'fail',
                data: { error: 'No tickets were created for this order' },
            }
        }

        await Promise.all(ticketsCreated.map((ticket) => { generateQrCode(ticket); }));

        return tickets;
    },
};

export default ticketTypeService;
