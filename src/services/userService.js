import { prisma as prismaClient } from '../config/db.js';
import { hashPassword } from './../utils/hash.js';
import userRoles from '../constants/enums/userRoles.js';

import eventService from './eventService.js';
import organizerService from './organizerService.js';

import { userRepository, organizerFollowerRepository } from './../repositories/index.js';
import userPolicy from './../policies/UserPolicy.js';

import AppError from '../errors/AppError.js';
import NotFoundError from './../errors/NotFoundError.js';
import ConflictError from './../errors/ConflictError.js';
import UserErrors from './../constants/messages/errors/user.js';
import OrganizerErrors from './../constants/messages/errors/organizer.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 * @typedef {import('@prisma/client').Prisma.UserDefaultArgs} UserDefaultArgs
 * @typedef {import('./../types/shared').PaginationQuery} PaginationQuery
 * @typedef {import('./../types/models').Organizer} Organizer
 * @typedef {import('./../types/models').UserWhere} UserWhere
 * @typedef {import('./../policies/UserPolicy').default} UserPolicy
 * @typedef {import('./../types/shared').RepositoryReadOptions<UserWhere, UserDefaultArgs['select'], UserDefaultArgs['include'], UserDefaultArgs['omit']> & PaginationQuery & UserWhere} UserListOptions
 * @typedef {import('./../types/shared').TransactionClient} TransactionClient
 * @typedef {import('./../types/dtos').UpgradeToOrganizerDTO} UpgradeToOrganizerDTO
 */

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

    async updatePhone(userId, phone) {
        return prismaClient.user.update({
            where: { id: userId },
            data: { phone },
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
     * @param {any} [file]
     * @returns {Promise<Organizer>}
     */
    async upgradeToOrganizer(userId, organizerData, file) {
        const user = await userRepository.findById(userId, { include: { Organizer: true } });
        userPolicy.canUpgrade(user);

        return userRepository.runInTransaction(async (tx) => {
            await this.updateRole(userId, userRoles.ORGANIZER, tx);
            return organizerService.createRecord(userId, organizerData, file, tx);
        });
    },

    /**
     * @param {string} userId
     * @param {string} role
     * @param {any} [tx]
     */
    async updateRole(userId, role, tx = null) {
        if (!Object.values(userRoles).includes(role)) {
            throw new AppError('Invalid role specified', 400);
        }

        return userRepository.updateRole(userId, role, tx);
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
                event: {
                    include: {
                        venue: true,
                        ticketTypes: true,
                        eventSessions: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const events = interestedEvents.map((item) => {
            const event = item.event;
            event.isInterested = true;
            return event;
        });
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

    async restoreDeleted(userId) {
        const user = await userRepository.withTrashed().findById(userId);

        if (!user) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: UserErrors.USER_NOT_FOUND.message,
                    code: UserErrors.USER_NOT_FOUND.code,
                },
            ]);
        }
        return userRepository.restoreDeleted(userId);
    },

    async countActiveUsers(days = 30) {
        return userRepository.countActiveUsers(days);
    },

    async countAllUsers() {
        return userRepository.countAllUsers();
    },

    async countDeletedUsers() {
        return userRepository.countDeletedUsers();
    },

    async countByRole(role) {
        return userRepository.countByRole(role);
    },

    async getUser(userId) {
        const user = await prismaClient.user.findFirst({
            where: { id: userId },
            include: {
                governorate: {
                    select: {
                        name: true,
                    },
                },
            },
            omit: {
                password: true,
                idInProviderDB: true,
                governorateId: true,
                updatedAt: true,
                deletedAt: true,
                isVerified: true,
            },
        });
        return {
            ...user,
            location: user.location || "",
            governorate: user.governorate?.name || "",
        };
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

    async checkWallet({ userId }) {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { wallet: true },
        });
        return user?.wallet || 0;
    },

    async findByPhoneNumber(number) {
        return prismaClient.user.findUnique({
            where: {
                phone: number,
            },
        });
    },

    /**
     * @param {UserListOptions} [options]
     */
    async list(options = {}) {
        return userRepository.getAllUsers(options);
    },

    /**
     * @param {string} userId
     */
    async findById(userId, projection = {}) {
        return userRepository.findById(userId);
    },

    /**
     * @param {string} userId
     * @param {string} organizerId
     * @returns {Promise<void>}
     */
    async followOrganizer(userId, organizerId) {
        const organizer = await organizerService.findById(organizerId);
        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        if (organizer.userId === userId) {
            throw new ConflictError(undefined, undefined, [
                {
                    message: 'You cannot follow your own organizer profile',
                    code: 'CANNOT_FOLLOW_SELF',
                },
            ]);
        }

        const isFollowing = await organizerFollowerRepository.isFollowing(userId, organizerId);
        if (isFollowing) {
            throw new ConflictError(undefined, undefined, [UserErrors.ALREADY_FOLLOWING]);
        }

        await organizerFollowerRepository.create({
            userId,
            organizerId,
        });
    },

    /**
     * @param {string} userId
     * @param {string} organizerId
     * @returns {Promise<void>}
     */
    async unfollowOrganizer(userId, organizerId) {
        const isFollowing = await organizerFollowerRepository.isFollowing(userId, organizerId);
        if (!isFollowing) {
            throw new NotFoundError(undefined, undefined, [UserErrors.NOT_FOLLOWING]);
        }

        await organizerFollowerRepository.deleteMany({
            where: {
                userId,
                organizerId,
            },
        });
    },
};

export default userService;
