import authService from '../authService.js';
import { matchPassword } from '../../utils/hash.js';
import { prisma as prismaClient } from '../../config/db.js';
import AppError from '../../errors/AppError.js';
import OrderStatus from '../../constants/enums/orderStatus.js';
import UserRoles from '../../constants/enums/userRoles.js';
import TicketStatus from '../../constants/enums/ticketStatus.js';
import { QRCodeStatus } from '../../constants/enums/qrcodeStatus.js';

const mobileService = {
    async login({ email, password }) {
        const existingUser = await prismaClient.user.findUnique({
            where: { email },
            include: { Organizer: true },
        });

        if (!existingUser) {
            throw new AppError('Invalid credentials', 401);
        }

        if (existingUser.role !== UserRoles.ORGANIZER) {
            throw new AppError('Only organizers can log in to the mobile app', 403);
        }

        if (existingUser.authProvider !== 'LOCAL') {
            throw new AppError(`Please log in using local authentication`, 400);
        }

        const isPasswordValid = await matchPassword(password, existingUser.password);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        const { accessToken, expiresIn } = authService.generateAccessTokenMobile(existingUser);

        return {
            token: accessToken,
            expiresIn: expiresIn,
            organizer: {
                id: existingUser.Organizer?.id,
                name: existingUser.Organizer?.name || existingUser.name,
            },
        };
    },

    async scanTicket({ ticketId, organizerId }) {
        const result = await prismaClient.$transaction(async (tx) => {
            const ticket = await tx.ticket.findUnique({
                where: { id: ticketId },
                include: {
                    order: { select: { status: true } },
                    ticketType: {
                        include: {
                            event: {
                                select: {
                                    title: true,
                                    organizerId: true,
                                    organizer: {
                                        select: {
                                            id: true,
                                            userId: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    user: { select: { name: true } },
                },
            });

            if (!ticket) {
                throw new AppError('Ticket not found', 404);
            }

            if (ticket.ticketType.event.organizer.userId !== organizerId) {
                throw new AppError('Unauthorized to scan this ticket', 403);
            }

            if (ticket.order?.status !== OrderStatus.COMPLETED) {
                throw new AppError('Order not completed', 400);
            }

            if (ticket.status === TicketStatus.USED) {
                throw new AppError('Ticket has already been used', 400);
            }

            if (ticket.status !== TicketStatus.VALID) {
                throw new AppError('Ticket is not valid for scanning', 400);
            }

            const updatedTicket = await tx.ticket.updateMany({
                where: {
                    id: ticketId,
                    status: TicketStatus.VALID,
                },
                data: { status: TicketStatus.USED },
            });

            if (updatedTicket.count === 0) {
                throw new AppError('Ticket has already been processed', 400);
            }

            await tx.qrCode.update({
                where: { ticketId },
                data: { status: QRCodeStatus.USED },
            });

            return {
                message: 'Ticket scanned successfully',
                ticketId: ticket.id,
                status: TicketStatus.USED,
                eventName: ticket.ticketType.event.title,
                attendeeName: ticket.user.name,
            };
        });

        return result;
    },
};

export default mobileService;
