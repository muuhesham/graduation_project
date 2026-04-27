//@ts-check

import asyncWrapper from './../middlewares/asyncWrapper.js';
import { sendSuccess } from './../utils/response.js';

import adminService from './../services/adminService.js';
import couponService from './../services/couponService.js';
import {
    AdminActiveUsersResource,
    AdminDashboardSummaryResource,
    AdminEventResource,
    AdminOrganizerResource,
    AdminPayoutResource,
    AdminReviewQueueResource,
    AdminTicketSalesResource,
    AdminUserResource,
} from './../resources.js';

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {Request & { user?: import('./../types/express/common.types.js').AuthUser }} AuthRequest
 *
 * @typedef {import('./../services/adminService.js').default} AdminService
 *
 * @typedef {import('./../types/dtos').AdminRegisterDTO} AdminRegisterDTO
 *
 * @typedef {import('./../types/dtos').AdminLoginDTO} AdminLoginDTO
 *
 * @typedef {import('./../types/dtos').AdminRefreshTokenDTO} AdminRefreshTokenDTO
 *
 * @typedef {import('./../types/dtos').AdminBanUserDTO} AdminBanUserDTO
 *
 * @typedef {import('./../types/dtos').AdminDeleteUserDTO} AdminDeleteUserDTO
 *
 * @typedef {import('./../types/dtos').AdminRestoreUserDTO} AdminRestoreUserDTO
 *
 * @typedef {import('./../types/dtos').AdminUserParamsDTO} AdminUserParamsDTO
 *
 * @typedef {import('./../types/dtos').AdminTicketsSoldByEventDTO} AdminTicketsSoldByEventDTO
 *
 * @typedef {import('./../types/dtos').AdminRevenueByEventDTO} AdminRevenueByEventDTO
 *
 * @typedef {import('./../types/dtos').AdminEventParamsDTO} AdminEventParamsDTO
 *
 * @typedef {import('./../types/dtos').AdminListEventsQueryDTO} AdminListEventsQueryDTO
 *
 * @typedef {import('./../types/dtos').AdminListUsersQueryDTO} AdminListUsersQueryDTO
 *
 * @typedef {import('./../types/dtos').AdminListOrganizersQueryDTO} AdminListOrganizersQueryDTO
 *
 * @typedef {import('./../types/dtos').AdminDashboardSummaryQueryDTO} AdminDashboardSummaryQueryDTO
 *
 * @typedef {import('./../types/dtos').AdminReviewQueueQueryDTO} AdminReviewQueueQueryDTO
 *
 * @typedef {import('./../types/dtos').AdminDashboardOverviewQueryDTO} AdminDashboardOverviewQueryDTO
 *
 * @typedef {import('./../types/dtos').AdminOrganizerParamsDTO} AdminOrganizerParamsDTO
 *
 * @typedef {import('./../types/dtos').AdminRejectOrganizerDTO} AdminRejectOrganizerDTO
 *
 * @typedef {import('./../types/dtos').AdminSuspendOrganizerDTO} AdminSuspendOrganizerDTO
 *
 * @typedef {import('./../types/dtos').AdminProcessPayoutsDTO} AdminProcessPayoutsDTO
 *
 * @typedef {import('./../types/dtos').AdminCreateCouponDTO} AdminCreateCouponDTO
 *
 * @typedef {AuthRequest & { body: Record<string, never> }} AuthenticatedNoBodyRequest
 * @typedef {AuthRequest & { body: AdminRejectOrganizerDTO }} RejectOrganizerRequest
 * @typedef {AuthRequest & { body: AdminSuspendOrganizerDTO }} SuspendOrganizerRequest
 * @typedef {AuthRequest & { body: AdminProcessPayoutsDTO }} ProcessPayoutsRequest
 * @typedef {AuthRequest & { body: AdminCreateCouponDTO }} CreateCouponRequest
 */

class AdminController {
    /** @type {AdminService} */
    #adminService;
    /** @type {typeof import('./../services/couponService.js').default} */
    #couponService;

    /**
     * @param {AdminService} adminService
     * @param {typeof import('./../services/couponService.js').default} couponService
     */
    constructor(adminService, couponService) {
        this.#adminService = adminService;
        this.#couponService = couponService;
    }

    register = asyncWrapper(
        /**
         * @param {Request & { body: AdminRegisterDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const { name, email, password } = req.body;

            const data = await this.#adminService.register({ name, email, password });

            return sendSuccess(res, data, 201);
        }
    );

    login = asyncWrapper(
        /**
         * @param {Request & { body: AdminLoginDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const { email, password } = req.body;

            const data = await this.#adminService.login({ email, password });

            return sendSuccess(res, data);
        }
    );

    refreshToken = asyncWrapper(
        /**
         * @param {Request & { body: AdminRefreshTokenDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const { refreshToken } = req.body;

            const accessToken = await this.#adminService.refreshSession({ refreshToken });

            return sendSuccess(res, { accessToken });
        }
    );

    logout = asyncWrapper(
        /**
         * @param {Request & { body: AdminRefreshTokenDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const { refreshToken } = req.body;

            await this.#adminService.logout({ refreshToken });

            return sendSuccess(res, null, 204);
        }
    );

    deleteUser = asyncWrapper(
        /**
         * @param {Request & { params: AdminDeleteUserDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { userId } = req.params;

            const data = await this.#adminService.deleteUser(adminId, userId);

            return sendSuccess(res, data);
        }
    );

    restoreUser = asyncWrapper(
        /**
         * @param {AuthRequest & { params: AdminRestoreUserDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { userId } = req.params;

            const data = await this.#adminService.restoreUser(adminId, userId);

            return sendSuccess(res, { user: AdminUserResource.make(data) });
        }
    );

    getUser = asyncWrapper(
        /**
         * @param {Request & { params: AdminUserParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { userId } = req.params;

            const data = await this.#adminService.getUserById(adminId, userId);

            return sendSuccess(res, { user: AdminUserResource.make(data) });
        }
    );

    ticketsSoldByEvent = asyncWrapper(
        /**
         * @param {Request & { params: AdminTicketsSoldByEventDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { eventId } = req.params;

            const data = await this.#adminService.ticketsSoldByEvent(adminId, eventId);

            return sendSuccess(res, {
                ticketTypes: AdminTicketSalesResource.collection(data),
            });
        }
    );

    revenueByEvent = asyncWrapper(
        /**
         * @param {Request & { params: AdminRevenueByEventDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { eventId } = req.params;

            const data = await this.#adminService.revenueByEvent(adminId, eventId);

            return sendSuccess(res, {
                revenue: data,
            });
        }
    );

    deleteEvent = asyncWrapper(
        /**
         * @param {Request & { params: AdminEventParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { eventId } = req.params;

            const data = await this.#adminService.deleteEvent(adminId, eventId);

            return sendSuccess(res, { event: AdminEventResource.make(data) }, 200);
        }
    );

    restoreEvent = asyncWrapper(
        /**
         * @param {Request & { params: AdminEventParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { eventId } = req.params;

            const data = await this.#adminService.restoreEvent(adminId, eventId);

            return sendSuccess(res, { event: AdminEventResource.make(data) }, 200);
        }
    );

    listEvents = asyncWrapper(
        /**
         * @param {Request & { query: AdminListEventsQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { page, limit, q, type, mode, organizerId, venueId, categoryId, hasSeatMap } =
                req.query;

            const data = await this.#adminService.listEvents(adminId, {
                page,
                limit,
                q,
                type,
                mode,
                organizerId,
                venueId,
                categoryId,
                hasSeatMap,
            });

            return sendSuccess(res, AdminEventResource.paginate(data));
        }
    );

    getEvent = asyncWrapper(
        /**
         * @param {Request & { params: AdminEventParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { eventId } = req.params;

            const data = await this.#adminService.getEventById(adminId, eventId);

            return sendSuccess(res, { event: AdminEventResource.make(data) });
        }
    );

    activeUsers = asyncWrapper(
        /**
         * @param {Request & { query: { days?: number } }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const days = req.query.days ?? 30;

            const data = await this.#adminService.activeUsers(adminId, days);

            return sendSuccess(res, AdminActiveUsersResource.make(data));
        }
    );

    dashboardSummary = asyncWrapper(
        /**
         * @param {Request & { query: AdminDashboardSummaryQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { days } = req.query;

            const data = await this.#adminService.getDashboardSummary(adminId, { days });

            return sendSuccess(res, AdminDashboardSummaryResource.make(data));
        }
    );

    reviewQueue = asyncWrapper(
        /**
         * @param {Request & { query: AdminReviewQueueQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { page, limit } = req.query;

            const data = await this.#adminService.getReviewQueue(adminId, { page, limit });

            return sendSuccess(res, AdminReviewQueueResource.paginate(data));
        }
    );

    dashboardOverview = asyncWrapper(
        /**
         * @param {Request & { query: AdminDashboardOverviewQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { days, page, limit } = req.query;

            const data = await this.#adminService.dashboardOverview(adminId, {
                days,
                page,
                limit,
            });

            return sendSuccess(res, {
                summary: AdminDashboardSummaryResource.make(data.summary),
                reviewQueue: AdminReviewQueueResource.paginate(data.reviewQueue),
            });
        }
    );

    listUsers = asyncWrapper(
        /**
         * @param {Request & { query: AdminListUsersQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { page, limit, gender, isVerified, languagePreference, isCompleted, createdAt } =
                req.query;

            const users = await this.#adminService.listUsers(adminId, {
                page,
                limit,
                gender,
                isVerified,
                languagePreference,
                isCompleted,
                createdAt,
            });

            return sendSuccess(res, AdminUserResource.paginate(users));
        }
    );

    listOrganizers = asyncWrapper(
        /**
         * @param {Request & { query: AdminListOrganizersQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { page, limit, status, verificationStatus } = req.query;

            const data = await this.#adminService.listOrganizers(adminId, {
                page,
                limit,
                status,
                verificationStatus,
            });

            return sendSuccess(res, AdminOrganizerResource.paginate(data));
        }
    );

    getOrganizer = asyncWrapper(
        /**
         * @param { Request & { params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { organizerId } = req.params;

            const data = await this.#adminService.getOrganizerById(adminId, organizerId);

            return sendSuccess(res, { organizer: AdminOrganizerResource.make(data) });
        }
    );

    approveOrganizer = asyncWrapper(
        /**
         * @param {AuthenticatedNoBodyRequest & { params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const { organizerId } = req.params;
            const adminId = Number(/** @type {any} */ (req).user.id);

            const data = await this.#adminService.approveOrganizer(adminId, organizerId);

            return sendSuccess(res, { organizer: AdminOrganizerResource.make(data) });
        }
    );

    rejectOrganizer = asyncWrapper(
        /**
         * @param {RejectOrganizerRequest & { params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { organizerId } = req.params;
            const { reason } = req.body;

            const data = await this.#adminService.rejectOrganizer(adminId, organizerId, reason);

            return sendSuccess(res, { organizer: AdminOrganizerResource.make(data) });
        }
    );

    suspendOrganizer = asyncWrapper(
        /**
         * @param {SuspendOrganizerRequest & { params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { organizerId } = req.params;
            const { reason } = req.body;

            const data = await this.#adminService.suspendOrganizer(adminId, organizerId, reason);

            return sendSuccess(res, { organizer: AdminOrganizerResource.make(data) });
        }
    );

    reactivateOrganizer = asyncWrapper(
        /**
         * @param {AuthenticatedNoBodyRequest & { params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { organizerId } = req.params;

            const data = await this.#adminService.reactivateOrganizer(adminId, organizerId);

            return sendSuccess(res, { organizer: AdminOrganizerResource.make(data) });
        }
    );

    processPayouts = asyncWrapper(
        /**
         * @param {AuthRequest & { body: AdminProcessPayoutsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { days } = req.body;

            const data = await this.#adminService.processPayouts(adminId, { days });

            return sendSuccess(res, AdminPayoutResource.make(data));
        }
    );

    payoutHistory = asyncWrapper(
        /**
         * @param {AuthRequest} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { page, limit } = req.query;

            const data = await this.#adminService.getPayoutHistory(adminId, {
                page: Number(page),
                limit: Number(limit),
            });

            return sendSuccess(res, data);
        }
    );

    financeSummary = asyncWrapper(
        /**
         * @param {AuthRequest & { query: { days?: number } }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = Number(/** @type {any} */ (req).user.id);
            const { days } = req.query;

            const data = await this.#adminService.getFinanceSummary(adminId, { days });

            return sendSuccess(res, data);
        }
    );

    listCoupons = asyncWrapper(
        /**
         * @param {Request} req
         * @param {Response} res
         */
        async (req, res) => {
            const coupons = await this.#couponService.getAllCoupons({});
            return sendSuccess(res, { coupons });
        }
    );

    createCoupon = asyncWrapper(
        /**
         * @param {CreateCouponRequest} req
         * @param {Response} res
         */
        async (req, res) => {
            const { code, discount } = req.body;
            const coupon = await this.#couponService.createCoupon({ code, discount });
            return sendSuccess(res, { coupon }, 201);
        }
    );

    deleteCoupon = asyncWrapper(
        /**
         * @param {Request & { params: { id: string } }} req
         * @param {Response} res
         */
        async (req, res) => {
            const { id } = req.params;
            await this.#couponService.deleteCoupon({ id: Number(id) });
            return sendSuccess(res, null, 204);
        }
    );
}

export default new AdminController(adminService, couponService);
export { AdminController };
