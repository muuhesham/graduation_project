//@ts-check
import { prisma as prismaClient } from '../config/db.js';

import { hashPassword } from './../utils/hash.js';

import userRoles from '../constants/enums/userRoles.js';

import eventService from './eventService.js';
import organizerService from './organizerService.js';

import userPolicy from './../policies/UserPolicy.js';

import AppError from '../errors/AppError.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 *
 * @typedef {import('./../types/models').Organizer} Organizer
 *
 * @typedef {import('./../policies/UserPolicy.js').default} UserPolicy
 */

/** @typedef {import('./../types/dtos').UpgradeToOrganizerDTO} UpgradeToOrganizerDTO */

const userService = {
    /**
     * @private
     * @type {UserPolicy}
     */
    userPolicy: userPolicy,

    async create(user, tx = prismaClient) {
        const existingUser = await userService.findByEmail(user.email);

        if (existingUser) {
            return {
                status: 'fail',
                data: { error: 'User already registered' },
            };
        }

        user.password = await hashPassword(user.password);

        return tx.user.create({
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

    async markPhoneVerified(userId) {
        return prismaClient.user.update({
            where: { id: userId },
            data: { isPhoneVerified: true },
        });
    },

    async markPhoneVerifiedByPhone(phone) {
        return prismaClient.user.update({
            where: { phone },
            data: { isPhoneVerified: true },
        });
    },

    async updatePhone(userId, phone) {
        return prismaClient.user.update({
            where: { id: userId },
            data: { phone, isPhoneVerified: false },
        });
    },

    async updatePassword(email, password) {
        return prismaClient.user.update({
            where: { email: email },
            data: { password: password },
        });
    },

    /**
     * @param {string} userId
     * @param {UpgradeToOrganizerDTO} organizerData
     * @returns {Promise<Organizer>}
     */
    async upgradeToOrganizer(userId, organizerData) {
        const user = await userService.findById(userId);
        this.userPolicy.canUpgrade(user);

        return prismaClient.$transaction(
            /** @param {TransactionClient} tx */
            async (tx) => {
                await userService.updateRole(userId, userRoles.ORGANIZER, tx);
                const organizer = await organizerService.create(
                    userId,
                    {
                        ...organizerData,
                        type: /** @type {import('@prisma/client').OrganizerType} */ (
                            organizerData.organizerType
                        ),
                    },
                    tx
                );

                return organizer;
            }
        );
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

    async getInterestedEvents({ userId }) {
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

    async isEmailAvailable({ newEmail, confirmEmail }) {
        if (newEmail !== confirmEmail) {
            throw new AppError(`Emails don't match`, 400, 'EMAILS_MISMATCH');
        }

        const currentEmail = await prismaClient.user.findUnique({
            where: { email: newEmail },
            select: { email: true },
        });

        if (currentEmail) {
            throw new AppError(
                'This email cannot be used. Please try another or log in to your existing account.',
                400,
                'EMAIL_NOT_AVAILABLE'
            );
        }
    },

    async findEmailById({ userId }) {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });
        return user;
    },

    findByPhoneNumber(number) {
        return prismaClient.user.findUnique({
            where: {
                phone: number,
            },
        });
    },
};

export default userService;
