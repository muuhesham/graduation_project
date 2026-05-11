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
    NewsletterSubscriberResource,
    CategoryResource,
} from './../resources.js';

import OrganizerSuccessMessages from '../constants/messages/success/organizer.js';
import CategorySuccessMessages from '../constants/messages/success/category.js';

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('./../types/express').AuthRequest} AuthRequest
 *
 * @typedef {import('./../services/adminService').default} AdminService
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
 * @typedef {AuthRequest & { query: { page?: number, limit?: number, q?: string } }} ListNewsletterRequest
 */

class AdminController {
    /** @type {AdminService} */
    #adminService;
    /** @type {typeof import('./../services/couponService').default} */
    #couponService;

    /**
     * @param {AdminService} adminService
     * @param {typeof import('./../services/couponService').default} couponService
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
         * @param {AuthRequest & { params: AdminDeleteUserDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
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
            const adminId = req.user.id;
            const { userId } = req.params;

            const data = await this.#adminService.restoreUser(adminId, userId);

            return sendSuccess(res, { user: AdminUserResource.make(data) });
        }
    );

    getUser = asyncWrapper(
        /**
         * @param {AuthRequest & { params: AdminUserParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { userId } = req.params;

            const data = await this.#adminService.getUserById(adminId, userId);

            return sendSuccess(res, { user: AdminUserResource.make(data) });
        }
    );

    ticketsSoldByEvent = asyncWrapper(
        /**
         * @param {AuthRequest & { params: AdminTicketsSoldByEventDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { eventId } = req.params;

            const data = await this.#adminService.ticketsSoldByEvent(adminId, eventId);

            return sendSuccess(res, {
                ticketTypes: AdminTicketSalesResource.collection(data),
            });
        }
    );

    revenueByEvent = asyncWrapper(
        /**
         * @param {AuthRequest & { params: AdminRevenueByEventDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { eventId } = req.params;

            const data = await this.#adminService.revenueByEvent(adminId, eventId);

            return sendSuccess(res, {
                revenue: data,
            });
        }
    );

    deleteEvent = asyncWrapper(
        /**
         * @param {AuthRequest & { params: AdminEventParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { eventId } = req.params;

            const data = await this.#adminService.deleteEvent(adminId, eventId);

            return sendSuccess(res, { event: AdminEventResource.make(data) }, 200);
        }
    );

    restoreEvent = asyncWrapper(
        /**
         * @param {AuthRequest & { params: AdminEventParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { eventId } = req.params;

            const data = await this.#adminService.restoreEvent(adminId, eventId);

            return sendSuccess(res, { event: AdminEventResource.make(data) }, 200);
        }
    );

    listEvents = asyncWrapper(
        /**
         * @param {AuthRequest & { query: AdminListEventsQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const {
                page,
                limit,
                q,
                type,
                mode,
                status,
                withTrashed,
                organizerId,
                venueId,
                categoryId,
                hasSeatMap,
            } = req.query;

            const data = await this.#adminService.listEvents(adminId, {
                page,
                limit,
                q,
                type,
                mode,
                status,
                withTrashed,
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
         * @param {AuthRequest & { params: AdminEventParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { eventId } = req.params;

            const data = await this.#adminService.getEventById(adminId, eventId);

            return sendSuccess(res, { event: AdminEventResource.make(data) });
        }
    );

    activeUsers = asyncWrapper(
        /**
         * @param {AuthRequest & { query: { days?: number } }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const days = req.query.days ?? 30;

            const data = await this.#adminService.activeUsers(adminId, days);

            return sendSuccess(res, AdminActiveUsersResource.make(data));
        }
    );

    dashboardSummary = asyncWrapper(
        /**
         * @param {AuthRequest & { query: AdminDashboardSummaryQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { days } = req.query;

            const data = await this.#adminService.getDashboardSummary(adminId, { days });

            return sendSuccess(res, AdminDashboardSummaryResource.make(data));
        }
    );

    reviewQueue = asyncWrapper(
        /**
         * @param {AuthRequest & { query: AdminReviewQueueQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { page, limit } = req.query;

            const data = await this.#adminService.getReviewQueue(adminId, { page, limit });

            return sendSuccess(res, AdminReviewQueueResource.paginate(data));
        }
    );

    dashboardOverview = asyncWrapper(
        /**
         * @param {AuthRequest & { query: AdminDashboardOverviewQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
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
         * @param {AuthRequest & { query: AdminListUsersQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
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
         * @param {AuthRequest & { query: AdminListOrganizersQueryDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
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
         * @param { AuthRequest & { params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { organizerId } = req.params;

            const data = await this.#adminService.getOrganizerById(adminId, organizerId);

            return sendSuccess(res, { organizer: AdminOrganizerResource.make(data) });
        }
    );

    approveOrganizer = asyncWrapper(
        /**
         * @param {AuthRequest & { params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { organizerId } = req.params;

            const data = await this.#adminService.approveOrganizer(adminId, organizerId);

            return sendSuccess(res, {
                ...OrganizerSuccessMessages.ORGANIZER_APPROVED,
                organizer: AdminOrganizerResource.make(data),
            });
        }
    );

    rejectOrganizer = asyncWrapper(
        /**
         * @param {AuthRequest & { body: AdminRejectOrganizerDTO, params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { organizerId } = req.params;
            const { reason } = req.body;

            const data = await this.#adminService.rejectOrganizer(adminId, organizerId, reason);

            return sendSuccess(res, {
                ...OrganizerSuccessMessages.ORGANIZER_REJECTED,
                organizer: AdminOrganizerResource.make(data),
            });
        }
    );

    suspendOrganizer = asyncWrapper(
        /**
         * @param {AuthRequest & { body: AdminSuspendOrganizerDTO, params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { organizerId } = req.params;
            const { reason } = req.body;

            const data = await this.#adminService.suspendOrganizer(adminId, organizerId, reason);

            return sendSuccess(res, {
                ...OrganizerSuccessMessages.ORGANIZER_SUSPENDED,
                organizer: AdminOrganizerResource.make(data),
            });
        }
    );

    reactivateOrganizer = asyncWrapper(
        /**
         * @param {AuthRequest & { params: AdminOrganizerParamsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { organizerId } = req.params;

            const data = await this.#adminService.reactivateOrganizer(adminId, organizerId);

            return sendSuccess(res, {
                ...OrganizerSuccessMessages.ORGANIZER_REACTIVATED,
                organizer: AdminOrganizerResource.make(data),
            });
        }
    );

    processPayouts = asyncWrapper(
        /**
         * @param {AuthRequest & { body: AdminProcessPayoutsDTO }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
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
            const adminId = req.user.id;
            const { page, limit } = req.query;

            const data = await this.#adminService.getPayoutHistory(adminId, {
                page,
                limit,
            });

            return sendSuccess(res, AdminPayoutResource.paginate(data));
        }
    );

    financeSummary = asyncWrapper(
        /**
         * @param {AuthRequest & { query: { days?: number } }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { days } = req.query;

            const data = await this.#adminService.getFinanceSummary(adminId, { days });

            return sendSuccess(res, data);
        }
    );

    listCoupons = asyncWrapper(
        /**
         * @param {AuthRequest} req
         * @param {Response} res
         */
        async (req, res) => {
            const coupons = await this.#couponService.getAllCoupons({});
            return sendSuccess(res, { coupons });
        }
    );

    createCoupon = asyncWrapper(
        /**
         * @param {AuthRequest & { body: { code: string, discount: number } }} req
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
         * @param {AuthRequest & { params: { id: string } }} req
         * @param {Response} res
         */
        async (req, res) => {
            const { id } = req.params;
            await this.#couponService.deleteCoupon({ id: Number(id) });
            return sendSuccess(res, null, 204);
        }
    );

    listNewsletterSubscribers = asyncWrapper(
        /**
         * @param {ListNewsletterRequest} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const { page, limit, q } = req.query;

            const data = await this.#adminService.listNewsletterSubscribers(adminId, {
                page,
                limit,
                q,
            });

            return sendSuccess(res, NewsletterSubscriberResource.paginate(data));
        }
    );

    listCategories = asyncWrapper(
        /**
         * @param {AuthRequest} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const data = await this.#adminService.listCategories(adminId);
            return sendSuccess(res, { categories: CategoryResource.collection(data) });
        }
    );

    createCategory = asyncWrapper(
        /**
         * @param {AuthRequest & { body: { name: string }, file?: import('./../types/shared').MulterFile }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const data = await this.#adminService.createCategory(adminId, {
                ...req.body,
                image: req.file,
            });
            return sendSuccess(
                res,
                {
                    ...CategorySuccessMessages.CATEGORY_CREATED,
                    category: CategoryResource.make(data),
                },
                201
            );
        }
    );

    updateCategory = asyncWrapper(
        /**
         * @param {AuthRequest & { params: { id: number }, body: { name?: string }, file?: import('./../types/shared').MulterFile }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const categoryId = req.params.id;
            const data = await this.#adminService.updateCategory(adminId, categoryId, {
                ...req.body,
                image: req.file,
            });
            return sendSuccess(res, {
                ...CategorySuccessMessages.CATEGORY_UPDATED,
                category: CategoryResource.make(data),
            });
        }
    );

    deleteCategory = asyncWrapper(
        /**
         * @param {AuthRequest & { params: { id: number } }} req
         * @param {Response} res
         */
        async (req, res) => {
            const adminId = req.user.id;
            const categoryId = req.params.id;
            await this.#adminService.deleteCategory(adminId, categoryId);
            return sendSuccess(res, CategorySuccessMessages.CATEGORY_DELETED, 200);
        }
    );
}

export default new AdminController(adminService, couponService);
export { AdminController };
