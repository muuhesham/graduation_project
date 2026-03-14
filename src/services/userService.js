import { prisma as prismaClient } from '../config/db.js';
import { hashPassword } from './../utils/hash.js';
import userRoles from '../constants/enums/userRoles.js';
import organizerService from './organizerService.js';
import eventService from './eventService.js';
import AppError from '../errors/AppError.js';
import { AuthProvider } from '@prisma/client';

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

    async getInterestedEvents({userId}) {
        const interestedEvents = await prismaClient.interestedEvent.findMany({
            where: { userId },
            include: {
                event: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const events = interestedEvents.map((item) => item.event);
        const result = await eventService.getBannerAbsUrl(events);

        return result;
    },
    
    async findUser(userId) {
        const user = await prismaClient.user.findFirst({
            where: { id: userId },
        });
        return user;
    },

    async softDelete(userId) {
        await prismaClient.user.updateMany({
            where: { id: userId },
            data: { deletedAt: new Date() },
        });
    },

    async getUser(userId) {
        const user = await prismaClient.user.findFirst({
            where: { id: userId },
            omit: {
                id: true,
                password: true,
                idInProviderDB: true,
                governorateId: true,
                updatedAt: true,
                deletedAt: true,
                isVerified: true,
            },
        });
        return user;
    },

    async isEmailAvailable({newEmail, confirmEmail}) {
        if (newEmail !== confirmEmail) {
            throw new AppError(`Emails don't match`, 400);
        }

        const currentEmail = await prismaClient.user.findUnique({
            where: { email: newEmail },
            select: { email: true },
        });

        if (currentEmail) {
            throw new AppError('Unable to process your request', 400);
        }
    },

    async findEmailById({userId}) {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });
        return user;
    },

};

export default userService;
