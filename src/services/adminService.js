//@ts-check

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

import { JWT_KEY, JWT_REKEY } from './../config/env.js';
import { hashHMAC, hashPassword, matchPassword } from './../utils/hash.js';

import OrganizerVerficiationStatus from './../constants/enums/organizerVerificationStatus.js';
import OrganizerStatus from './../constants/enums/organizerStatus.js';

import userService from './userService.js';
import eventService from './eventService.js';
import organizerService from './organizerService.js';
import orderService from './orderService.js';
import paymentService from './paymentService.js';

import OrderStatus from '../constants/enums/orderStatus.js';
import PayoutStatus from '../constants/enums/payoutStatus.js';
import PayoutItemStatus from '../constants/enums/payoutItemStatus.js';

import { Order } from './../models/index.js';
import { adminRepository, payoutRepository } from './../repositories/index.js';

import InternalServerError from './../errors/InternalServerError.js';
import NotFoundError from './../errors/NotFoundError.js';
import UnauthorizedError from './../errors/UnauthroizedError.js';
import ValidationError from './../errors/ValidationError.js';
import ConflictError from '../errors/ConflictError.js';

import UserErrors from './../constants/messages/errors/user.js';
import EventErrors from './../constants/messages/errors/event.js';
import OrganizerErrors from './../constants/messages/errors/organizer.js';
import AdminErrors from './../constants/messages/errors/admin.js';
import adminPolicy from './../policies/AdminPolicy.js';

/**
 *
 * @typedef {import('./../types/models/event.model.js').Event} Event
 * @typedef {import('./userService.js').default} UserService
 * @typedef {import('./eventService.js').default} EventService
 * @typedef {import('./organizerService.js').default} OrganizerService
 * @typedef {import('./orderService.js').default} OrderService
 *
 *
 * @typedef {import('./../repositories/AdminRepository.js').default} AdminRepository
 * @typedef {import('./../models/Admin.js').default} AdminModel
 * @typedef {import('./../types/models/admin.model.js').AdminHydrated} AdminType
 * @typedef {import('./../types/models/admin.model.js').AdminCreate} AdminCreate
 *
 * @typedef {import('./../types/dtos/index.js').AdminRegisterDTO} AdminRegisterDTO
 * @typedef {import('./../types/dtos/index.js').AdminLoginDTO} AdminLoginDTO
 * @typedef {import('./../types/dtos/index.js').AdminRefreshTokenDTO} AdminRefreshTokenDTO
 * @typedef {import('./../types/dtos/index.js').AdminListEventsOptionsDTO} AdminListEventsOptionsDTO
 * @typedef {import('./../types/dtos/index.js').AdminDashboardSummaryQueryDTO} AdminDashboardSummaryQueryDTO
 *
 * */

/**
 * @typedef {object} AdminServiceDeps
 *
 * @property {object} services
 * @property {UserService} services.userService
 * @property {EventService} services.eventService
 * @property {OrganizerService} services.organizerService
 * @property {OrderService} services.orderService
 *
 * @property {object} repositories
 * @property {AdminRepository} repositories.adminRepository
 * @property {any} repositories.payoutRepository
 */

class AdminService {
    /** @type {UserService} */
    #userService;

    /** @type {EventService} */
    #eventService;

    /** @type {OrganizerService} */
    #organizerService;

    /** @type {OrderService} */
    #orderService;

    /** @type {AdminRepository} */
    #adminRepository;

    /** @type {any} */
    #payoutRepository;

    /**  */
    #adminPolicy = adminPolicy;

    /**
     * @param {AdminServiceDeps} deps
     */
    constructor({ services, repositories }) {
        this.#userService = services.userService;
        this.#eventService = services.eventService;
        this.#organizerService = services.organizerService;
        this.#orderService = services.orderService;
        this.#adminRepository = repositories.adminRepository;
        this.#payoutRepository = repositories.payoutRepository;
    }

    /**
     * @param {number} id
     */
    async #assertApprovedAdmin(id) {
        const admin = await this.#adminRepository.findById(id);
        this.#adminPolicy.canAccessDashboard(admin);
        return admin;
    }

    /**
     * @param {AdminRegisterDTO} dto
     */
    async register({ name, email, password }) {
        const existingAdmin = await this.#adminRepository.findByEmail(email);
        if (existingAdmin) {
            throw new ConflictError(undefined, undefined, [
                {
                    message: AdminErrors.EMAIL_ALREADY_IN_USE.message,
                    code: AdminErrors.EMAIL_ALREADY_IN_USE.code,
                },
            ]);
        }

        const hashedPassword = await hashPassword(password);

        const admin = await this.#adminRepository.create({
            name,
            email,
            password: hashedPassword,
        });

        const accessToken = this.#generateAccessToken(admin);
        const refreshToken = this.#generateRefreshToken();
        await this.#adminRepository.createRefreshToken(
            admin.id,
            this.#hashRefreshToken(refreshToken)
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * @param {AdminLoginDTO} dto
     */
    async login({ email, password }) {
        const admin = await this.#adminRepository.findByEmail(email);

        if (!admin) {
            throw new UnauthorizedError(undefined, undefined, [
                {
                    message: AdminErrors.INVALID_CREDENTIALS.message,
                    code: AdminErrors.INVALID_CREDENTIALS.code,
                },
            ]);
        }

        this.#adminPolicy.canLogin(admin);

        let isPasswordValid = await matchPassword(password, admin.password);
        if (!isPasswordValid && JWT_REKEY) {
            const legacyHash = hashHMAC(password, JWT_REKEY);
            isPasswordValid = legacyHash === admin.password;

            if (isPasswordValid) {
                const upgradedHash = await hashPassword(password);
                await this.#adminRepository.update({
                    where: { id: admin.id },
                    data: { password: upgradedHash },
                });
            }
        }

        if (!isPasswordValid) {
            throw new UnauthorizedError(undefined, undefined, [
                {
                    message: AdminErrors.INVALID_CREDENTIALS.message,
                    code: AdminErrors.INVALID_CREDENTIALS.code,
                },
            ]);
        }

        const accessToken = this.#generateAccessToken(admin);
        const refreshToken = this.#generateRefreshToken();
        await this.#adminRepository.createRefreshToken(
            admin.id,
            this.#hashRefreshToken(refreshToken)
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * @param {AdminType} admin
     * @returns {{ token: string, type: string, expiresIn: number }}
     */
    #generateAccessToken(admin) {
        if (!JWT_KEY) {
            throw new InternalServerError(undefined, undefined, [
                {
                    message: 'JWT_KEY is not defined in environment variables',
                    code: 'JWT_KEY_NOT_DEFINED',
                },
            ]);
        }

        if (!admin?.id || !admin?.email) {
            throw new ValidationError([], 'Admin must have id and email', 'INVALID_ADMIN');
        }

        const expiresIn = 15 * 60; // 15 minutes
        const token = jwt.sign(
            {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: 'admin',
            },
            JWT_KEY,
            { expiresIn }
        );

        return {
            token,
            type: 'Bearer',
            expiresIn,
        };
    }

    /**
     * @returns {string}
     */
    #generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }

    /**
     * @param {string} refreshToken
     */
    #hashRefreshToken(refreshToken) {
        if (!JWT_REKEY) {
            throw new InternalServerError(
                'JWT_REKEY is not defined in environment variables',
                'JWT_REKEY_NOT_DEFINED'
            );
        }

        return hashHMAC(refreshToken, JWT_REKEY);
    }

    /**
     * @param {AdminRefreshTokenDTO} dto
     */
    async refreshSession({ refreshToken }) {
        const tokenRecord = await this.#adminRepository.findRefreshToken(
            this.#hashRefreshToken(refreshToken)
        );

        if (!tokenRecord?.admin) {
            throw new UnauthorizedError(undefined, undefined, [
                {
                    message: AdminErrors.INVALID_REFRESH_TOKEN.message,
                    code: AdminErrors.INVALID_REFRESH_TOKEN.code,
                },
            ]);
        }

        this.#adminPolicy.canAccessDashboard(tokenRecord.admin);

        return this.#generateAccessToken(tokenRecord.admin);
    }

    /**
     * @param {AdminRefreshTokenDTO} dto
     */
    async logout({ refreshToken }) {
        const tokenRecord = await this.#adminRepository.findRefreshToken(
            this.#hashRefreshToken(refreshToken)
        );

        if (!tokenRecord) {
            throw new UnauthorizedError(undefined, undefined, [
                {
                    message: AdminErrors.INVALID_REFRESH_TOKEN.message,
                    code: AdminErrors.INVALID_REFRESH_TOKEN.code,
                },
            ]);
        }

        return this.#adminRepository.deleteRefreshToken(tokenRecord.id);
    }

    /**
     * @param {number} id
     * @param {string} userId
     */
    async deleteUser(id, userId) {
        await this.#assertApprovedAdmin(id);
        const user = await this.#userService.findById(userId);

        if (!user) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: UserErrors.USER_NOT_FOUND.message,
                    code: UserErrors.USER_NOT_FOUND.code,
                },
            ]);
        }

        return this.#userService.softDelete(userId);
    }

    /**
     * @param {number} id
     * @param {string} userId
     */
    async restoreUser(id, userId) {
        await this.#assertApprovedAdmin(id);

        return this.#userService.restoreDeleted(userId);
    }

    /**
     * @param {number} id
     * @param {string} userId
     */
    async getUserById(id, userId) {
        await this.#assertApprovedAdmin(id);
        const user = await this.#userService.findById(userId);

        if (!user) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: UserErrors.USER_NOT_FOUND.message,
                    code: UserErrors.USER_NOT_FOUND.code,
                },
            ]);
        }

        return user;
    }

    /**
     * @param {number} id
     * @param {string} organizerId
     */
    async approveOrganizer(id, organizerId) {
        await this.#assertApprovedAdmin(id);
        const organizer = await this.#organizerService.findById(organizerId);

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                    code: OrganizerErrors.ORGANIZER_NOT_FOUND.code,
                },
            ]);
        }

        if (organizer.verificationStatus === OrganizerVerficiationStatus.APPROVED) {
            throw new ConflictError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_ALREADY_APPROVED.message,
                    code: OrganizerErrors.ORGANIZER_ALREADY_APPROVED.code,
                },
            ]);
        }

        return this.#organizerService.updateModerationState(organizerId, {
            verificationStatus: OrganizerVerficiationStatus.APPROVED,
            status: OrganizerStatus.ACTIVE,
            rejectionReason: null,
            suspendReason: null,
            reviewedAt: new Date(),
            reviewedBy: id,
        });
    }

    /**
     * @param {number} id
     * @param {string} organizerId
     * @param {string} reason
     */
    async rejectOrganizer(id, organizerId, reason) {
        await this.#assertApprovedAdmin(id);
        const organizer = await this.#organizerService.findById(organizerId);

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                    code: OrganizerErrors.ORGANIZER_NOT_FOUND.code,
                },
            ]);
        }

        if (organizer.verificationStatus === OrganizerVerficiationStatus.REJECTED) {
            throw new ConflictError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_ALREADY_REJECTED.message,
                    code: OrganizerErrors.ORGANIZER_ALREADY_REJECTED.code,
                },
            ]);
        }

        return this.#organizerService.updateModerationState(organizerId, {
            verificationStatus: OrganizerVerficiationStatus.REJECTED,
            status: OrganizerStatus.SUSPENDED,
            rejectionReason: reason,
            suspendReason: null,
            reviewedAt: new Date(),
            reviewedBy: id,
        });
    }

    /**
     * @param {number} id
     * @param {string} organizerId
     * @param {string} reason
     */
    async suspendOrganizer(id, organizerId, reason) {
        await this.#assertApprovedAdmin(id);
        const organizer = await this.#organizerService.findById(organizerId);

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                    code: OrganizerErrors.ORGANIZER_NOT_FOUND.code,
                },
            ]);
        }

        if (organizer.status === OrganizerStatus.SUSPENDED) {
            throw new ConflictError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_ALREADY_SUSPENDED.message,
                    code: OrganizerErrors.ORGANIZER_ALREADY_SUSPENDED.code,
                },
            ]);
        }

        return this.#organizerService.updateModerationState(organizerId, {
            status: OrganizerStatus.SUSPENDED,
            suspendReason: reason,
            reviewedAt: new Date(),
            reviewedBy: id,
        });
    }

    /**
     * @param {number} id
     * @param {string} organizerId
     */
    async reactivateOrganizer(id, organizerId) {
        await this.#assertApprovedAdmin(id);
        const organizer = await this.#organizerService.findById(organizerId);

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                    code: OrganizerErrors.ORGANIZER_NOT_FOUND.code,
                },
            ]);
        }

        if (organizer.verificationStatus === OrganizerVerficiationStatus.REJECTED) {
            throw new ConflictError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_REJECTED.message,
                    code: OrganizerErrors.ORGANIZER_REJECTED.code,
                },
            ]);
        }

        if (organizer.status !== OrganizerStatus.SUSPENDED) {
            throw new ConflictError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_NOT_SUSPENDED.message,
                    code: OrganizerErrors.ORGANIZER_NOT_SUSPENDED.code,
                },
            ]);
        }

        return this.#organizerService.updateModerationState(organizerId, {
            status: OrganizerStatus.ACTIVE,
            suspendReason: null,
            reviewedAt: new Date(),
            reviewedBy: id,
        });
    }

    /**
     * @param {number} id
     * @param {number} eventId
     */
    async ticketsSoldByEvent(id, eventId) {
        await this.#assertApprovedAdmin(id);
        return this.#eventService.ticketsSoldByEvent(eventId);
    }

    /**
     * @param {number} id
     * @param {number} eventId
     */
    async revenueByEvent(id, eventId) {
        await this.#assertApprovedAdmin(id);
        return this.#eventService.revenueByEvent(eventId);
    }

    /**
     * @param {number} id
     * @param {number} eventId
     * @returns {Promise<Event | null>}
     */
    async deleteEvent(id, eventId) {
        await this.#assertApprovedAdmin(id);
        const event = /** @type {Event | null} */ (
            await this.#eventService.findById(eventId, {
                include: {
                    ticketTypes: {
                        select: {
                            sold: true,
                            orderItems: {
                                select: {
                                    order: {
                                        select: {
                                            id: true,
                                            status: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
        );

        if (!event) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: EventErrors.EVENT_NOT_FOUND.message,
                    code: EventErrors.EVENT_NOT_FOUND.code,
                },
            ]);
        }

        /** @type {any} */ (event).activeSeatReservations =
            (await this.#eventService.countActiveSeatReservations(eventId)) ?? 0;

        return this.#eventService.delete(eventId);
    }

    /**
     * @param {number} id
     * @param {number} eventId
     */
    async restoreEvent(id, eventId) {
        await this.#assertApprovedAdmin(id);
        return this.#eventService.restoreDeleted(eventId);
    }

    /**
     * @param {number} id
     * @param {AdminListEventsOptionsDTO} [options]
     */
    async listEvents(id, options = { page: 1, limit: 20 }) {
        await this.#assertApprovedAdmin(id);
        return this.#eventService.list({
            ...options,
            include: {
                ...(options.include || {}),
                category: true,
                eventTags: {
                    include: {
                        tag: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                ticketTypes: {
                    select: {
                        sold: true,
                        orderItems: {
                            select: {
                                order: {
                                    select: {
                                        id: true,
                                        status: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * @param {number} id
     * @param {number} eventId
     */
    async getEventById(id, eventId) {
        await this.#assertApprovedAdmin(id);
        const event = await this.#eventService.findById(eventId, {
            include: {
                category: true,
                eventTags: {
                    include: {
                        tag: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                ticketTypes: {
                    select: {
                        sold: true,
                        orderItems: {
                            select: {
                                order: {
                                    select: {
                                        id: true,
                                        status: true,
                                    },
                                },
                            },
                        },
                    },
                },

                venue: true,
            },
        });

        if (!event) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: EventErrors.EVENT_NOT_FOUND.message,
                    code: EventErrors.EVENT_NOT_FOUND.code,
                },
            ]);
        }

        return event;
    }

    /**
     * @param {number} id
     * @param {number} days
     */
    async activeUsers(id, days = 30) {
        await this.#assertApprovedAdmin(id);
        return this.#userService.countActiveUsers(days);
    }

    /**
     * @param {number} id
     * @param {AdminDashboardSummaryQueryDTO} [options]
     */
    async getDashboardSummary(id, options = {}) {
        await this.#assertApprovedAdmin(id);
        const days = options.days ?? 30;
        const [
            totalUsers,
            deletedUsers,
            activeUsers,
            totalOrganizers,
            pendingOrganizers,
            totalEvents,
            totalOrders,
            completedOrders,
            pendingOrders,
            cancelledOrders,
            totalRevenue,
        ] = await Promise.all([
            this.#userService.countAllUsers(),
            this.#userService.countDeletedUsers(),
            this.#userService.countActiveUsers(days),
            this.#organizerService.countAllOrganizers(),
            this.#organizerService.countByVerificationStatus(
                OrganizerVerficiationStatus.UNDER_REVIEW
            ),
            this.#eventService.countAllEvents(),
            this.#orderService.countAllOrders(),
            this.#orderService.countByStatus(OrderStatus.COMPLETED),
            this.#orderService.countByStatus(OrderStatus.PENDING),
            this.#orderService.countByStatus(OrderStatus.CANCELED),
            this.#orderService.revenueByStatus(OrderStatus.COMPLETED),
        ]);

        return {
            users: {
                total: totalUsers,
                deleted: deletedUsers,
                activeInPeriod: activeUsers,
            },
            organizers: {
                total: totalOrganizers,
                pendingReview: pendingOrganizers,
            },
            events: {
                total: totalEvents,
            },
            orders: {
                total: totalOrders,
                completed: completedOrders,
                pending: pendingOrders,
                cancelled: cancelledOrders,
                revenue: totalRevenue,
            },
        };
    }

    /**
     * @param {number} id
     * @param {{ page?: number, limit?: number }} [options]
     */
    async getReviewQueue(id, options = {}) {
        await this.#assertApprovedAdmin(id);
        return this.#organizerService.getReviewQueue(options);
    }

    /**
     * @param {number} id
     * @param {object} options
     * @param {number} [options.days]
     * @param {number} [options.page]
     * @param {number} [options.limit]
     */
    async dashboardOverview(id, options = {}) {
        await this.#assertApprovedAdmin(id);
        return {
            summary: await this.getDashboardSummary(id, { days: options.days }),
            reviewQueue: await this.getReviewQueue(id, {
                page: options.page,
                limit: options.limit,
            }),
        };
    }

    /**
     * @param {number} id
     * @param {import('./../types/models/user.model.js').UserFilters} [options]
     */
    async listUsers(id, options = {}) {
        await this.#assertApprovedAdmin(id);
        return this.#userService.list(options);
    }

    /**
     * @param {number} id
     * @param {import('./../types/models/organizer.model.js').OrganizerFilters} [options]
     */
    async listOrganizers(id, options = {}) {
        await this.#assertApprovedAdmin(id);

        return this.#organizerService.list(options);
    }

    /**
     * @param {number} id
     * @param {string} organizerId
     */
    async getOrganizerById(id, organizerId) {
        await this.#assertApprovedAdmin(id);
        const organizer = await this.#organizerService.findById(organizerId);

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                    code: OrganizerErrors.ORGANIZER_NOT_FOUND.code,
                },
            ]);
        }

        return organizer;
    }

    /**
     * Process a batch of payouts for organizers.
     * Marks orders as settled in DB and triggers external Stripe transfers.
     *
     * @param {number} adminId
     * @param {object} [options]
     * @param {number} [options.days=30]
     */
    async processPayouts(adminId, options = {}) {
        await this.#assertApprovedAdmin(adminId);

        const days = options.days || 30;
        const window = Order.payoutWindow(days);

        const orders = await this.#orderService.getPendingPayoutOrders({
            since: window.from,
        });

        if (orders.length === 0) {
            throw new ConflictError('No pending payouts found for the specified period');
        }

        const pendingSettlements = Order.computePayouts(orders);
        const totals = Order.payoutTotals(pendingSettlements);

        const payoutRecord = await this.#payoutRepository.runInTransaction(
            /** @param {import('@prisma/client').Prisma.TransactionClient} tx */
            async (tx) => {
                const payout = await this.#payoutRepository.create(
                    {
                        adminId,
                        amount: totals.grossAmount,
                        organizerCount: totals.organizers,
                        orderCount: totals.orders,
                        startDate: window.from,
                        endDate: window.to,
                        status: PayoutStatus.COMPLETED,
                        items: {
                            create: pendingSettlements.map((item) => ({
                                organizerId: item.organizerId,
                                amount: item.grossAmount,
                                status: PayoutItemStatus.PAID,
                            })),
                        },
                    },
                    tx
                );

                await this.#orderService.markOrdersAsPaid(window.from, payout.id, tx);
                return payout;
            }
        );

        const transfers = await this.#prepareTransferBatch(pendingSettlements, payoutRecord.id);
        await paymentService.executePayoutBatch(transfers);

        return {
            id: payoutRecord.id,
            status: payoutRecord.status,
            processedBy: adminId,
            processedAt: payoutRecord.createdAt.toISOString(),
            window: {
                days,
                from: window.from.toISOString(),
                to: window.to.toISOString(),
            },
            totals,
            payouts: pendingSettlements,
        };
    }

    /**
     * @param {import('./../repositories/OrderRepository.js').PayoutSummaryRow[]} settlements
     * @param {number} payoutId
     */
    async #prepareTransferBatch(settlements, payoutId) {
        const batch = [];
        for (const item of settlements) {
            const organizer = await this.#organizerService.findById(item.organizerId);
            if (organizer?.stripeAccountId) {
                batch.push({
                    amount: item.grossAmount,
                    accountId: organizer.stripeAccountId,
                    referenceId: payoutId,
                });
            }
        }
        return batch;
    }

    /**
     * @param {number} id
     * @param {import('./../types/shared/common.types.js').PaginationQuery} [pagination]
     */
    async getPayoutHistory(id, pagination = {}) {
        await this.#assertApprovedAdmin(id);
        return payoutRepository.paginate({
            ...pagination,
            include: { admin: true },
        });
    }

    /**
     * @param {number} id
     * @param {{ days?: number }} [options]
     */
    async getFinanceSummary(id, options = {}) {
        await this.#assertApprovedAdmin(id);
        const days = options.days || 0;
        const since = days > 0 ? Order.payoutWindow(days).from : new Date(0);

        const [totalVolume, orders] = await Promise.all([
            this.#orderService.revenueByStatus(OrderStatus.COMPLETED),
            this.#orderService.getPendingPayoutOrders({
                since,
            }),
        ]);

        const pendingSettlements = Order.computePayouts(orders);
        const pendingTotals = Order.payoutTotals(pendingSettlements);

        return {
            totalVolume: Order.parseAmount(totalVolume),
            pendingPayoutAmount: pendingTotals.grossAmount,
            pendingOrganizerCount: pendingTotals.organizers,
        };
    }
}

export default new AdminService({
    services: {
        userService,
        eventService,
        organizerService,
        orderService,
    },
    repositories: {
        adminRepository,
        payoutRepository,
    },
});

export { AdminService };
