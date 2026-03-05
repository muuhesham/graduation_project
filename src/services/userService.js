import { prisma as prismaClient } from '../config/db.js';
import { hashPassword } from './../utils/hash.js';
import userRoles from '../constants/enums/userRoles.js';
import organizerService from './organizerService.js';
import fileService from './fileService.js';
import orderStatus from '../constants/enums/orderStatus.js';

const userService = {
    async create(user) {
        const existingUser = await userService.findByEmail(user.email);

        if (existingUser) {
            return {
                status: 'fail',
                data: { error: 'User already registered' },
            };
        }

        user.password = await hashPassword(user.password);

        return prismaClient.user.create({
            data: user,
        });
    },

    async findByEmail(email) {
        return prismaClient.user.findFirst({
            where: { email },
        });
    },

    async isVerified(userId) {
        const user = await prismaClient.user.findFirst({
            where: {
                id: userId,
                isVerified: true,
            },
        });
        return !!user?.isVerified;
    },

    async markVerified(email) {
        return prismaClient.user.update({
            where: { email: email },
            data: { isVerified: true },
        });
    },

    async updatePassword(email, password) {
        return prismaClient.user.update({
            where: { email: email },
            data: { password: password },
        });
    },

    async upgradeToOrganizer(userId) {
        const user = await userService.findById(userId);
        if (!user) {
            return {
                status: 'fail',
                data: { error: 'User not found' },
            };
        }

        if (!user.isVerified) {
            return {
                status: 'fail',
                data: { error: 'User email is not verified' },
            };
        }

        if (user.role === userRoles.ORGANIZER) {
            return {
                status: 'fail',
                data: { error: 'User is already an organizer' },
            };
        }

        return prismaClient.$transaction(async (tx) => {
            await organizerService.create(userId, { isApproved: true }, tx);
            await userService.updateRole(userId, userRoles.ORGANIZER, tx);
            return {
                status: 'success',
                data: { message: 'User upgraded to organizer successfully' },
            };
        });
    },

    async findById(userId) {
        return prismaClient.user.findUnique({
            where: { id: userId },
        });
    },

    async updateRole(userId, role, tx = prismaClient) {
        if (!Object.values(userRoles).includes(role)) {
            return {
                status: 'fail',
                data: { error: 'Invalid role specified' },
            };
        }

        return tx.user.update({
            where: { id: userId },
            data: { role: role },
        });
    },

    async isOrganizer(id) {
        const user = await prismaClient.user.findFirst({
            where: {
                id: id,
                role: userRoles.ORGANIZER,
            },
        });
        return !!user;
    },

    async getUserTickets(userId) {
        const tickets = await prismaClient.ticket.findMany({
            where: {
                userId,
                orderItem: {
                    order: {
                        status: orderStatus.COMPLETED,
                    },
                },
            },
            select: {
                id: true,
                status: true,
                orderId: true,
                ticketType: {
                    select: {
                        event: {
                            select: {
                                title: true,
                                bannerPath: true,
                            },
                        },
                    },
                },
                qrCode: {
                    select: {
                        codePath: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!tickets || tickets.length === 0) {
            return [];
        }

        const ticketsWithAbsQr = await Promise.all(tickets.map(async (ticket) => {
            if(ticket.qrCode?.codePath) {
                ticket.qrCode.qrAbsUrl = `http://localhost:8000${ticket.qrCode.codePath}`;
            }
            if(ticket.ticketType?.event?.bannerPath) {
                ticket.ticketType.event.bannerAbsUrl = fileService.getAbsUrl(ticket.ticketType.event.bannerPath);
            }
            return ticket;
        }));

        return ticketsWithAbsQr;
    },
};

export default userService;
