//@ts-check

import { Router } from 'express';

import adminController from './../controllers/adminController.js';
import adminValidation from './../validations/adminValidation.js';

import { authLimiter } from './../middlewares/rateLimiter.js';
import validate from './../middlewares/validate.js';
import { adminAuth } from './../middlewares/auth.js';
import authorize from './../middlewares/authorize.js';
import { restrictToLocalhost } from './../middlewares/network.js';
import couponValidation from './../validations/couponValidation.js';
import { upload } from './../middlewares/upload.js';

/** @type {Router} */
const router = Router();
const authLimiterHandler = /** @type {import('express').RequestHandler} */ (authLimiter);
const adminOnly = [adminAuth, authorize.isAdmin];

/**
 * @openapi
 * /api/v1/admin/coupons:
 *   get:
 *     summary: List all coupons
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of coupons
 */
router.get('/coupons', ...adminOnly, adminController.listCoupons);

/**
 * @openapi
 * /api/v1/admin/coupons:
 *   post:
 *     summary: Create a new coupon
 *     tags: [Admin]
 *     responses:
 *       201:
 *         description: Coupon created successfully
 */
router.post(
    '/coupons',
    ...adminOnly,
    couponValidation.createCoupon,
    validate,
    adminController.createCoupon
);

/**
 * @openapi
 * /api/v1/admin/coupons/{id}:
 *   delete:
 *     summary: Delete a coupon
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 */
router.delete(
    '/coupons/:id',
    ...adminOnly,
    couponValidation.deleteCoupon,
    validate,
    adminController.deleteCoupon
);

/**
 * @openapi
 * /api/v1/admin/auth/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     responses:
 *       201:
 *         description: Admin registered successfully
 */
router.post(
    '/auth/register',
    adminValidation.register,
    validate,
    adminController.register
);

/**
 * @openapi
 * /api/v1/admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
    '/auth/login',
    authLimiterHandler,
    adminValidation.login,
    validate,
    adminController.login
);

/**
 * @openapi
 * /api/v1/admin/auth/refresh:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/auth/refresh', adminValidation.refreshToken, validate, adminController.refreshToken);

/**
 * @openapi
 * /api/v1/admin/auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/auth/logout', adminValidation.logout, validate, adminController.logout);

/**
 * @openapi
 * /api/v1/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete(
    '/users/:userId',
    ...adminOnly,
    adminValidation.deleteUser,
    validate,
    adminController.deleteUser
);

/**
 * @openapi
 * /api/v1/admin/users/{userId}/restore:
 *   patch:
 *     summary: Restore a deleted user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User restored successfully
 */
router.patch(
    '/users/:userId/restore',
    ...adminOnly,
    adminValidation.restoreUser,
    validate,
    adminController.restoreUser
);

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of users
 */
router
    .route('/users')
    .get(...adminOnly, adminValidation.listUsersQuery, validate, adminController.listUsers);

/**
 * @openapi
 * /api/v1/admin/users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
router.get(
    '/users/:userId',
    ...adminOnly,
    adminValidation.userIdParam,
    validate,
    adminController.getUser
);

/**
 * @openapi
 * /api/v1/admin/organizers:
 *   get:
 *     summary: List all organizers
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of organizers
 */
router.get(
    '/organizers',
    ...adminOnly,
    adminValidation.listOrganizersQuery,
    validate,
    adminController.listOrganizers
);

/**
 * @openapi
 * /api/v1/admin/organizers/{organizerId}:
 *   get:
 *     summary: Get an organizer by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organizer details
 */
router.get(
    '/organizers/:organizerId',
    ...adminOnly,
    adminValidation.organizerIdParam,
    validate,
    adminController.getOrganizer
);

/**
 * @openapi
 * /api/v1/admin/organizers/{organizerId}/approve:
 *   patch:
 *     summary: Approve an organizer
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organizer approved
 */
router.patch(
    '/organizers/:organizerId/approve',
    ...adminOnly,
    adminValidation.organizerIdParam,
    validate,
    adminController.approveOrganizer
);

/**
 * @openapi
 * /api/v1/admin/organizers/{organizerId}/reject:
 *   patch:
 *     summary: Reject an organizer
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organizer rejected
 */
router.patch(
    '/organizers/:organizerId/reject',
    ...adminOnly,
    adminValidation.rejectOrganizer,
    validate,
    adminController.rejectOrganizer
);

/**
 * @openapi
 * /api/v1/admin/organizers/{organizerId}/suspend:
 *   patch:
 *     summary: Suspend an organizer
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organizer suspended
 */
router.patch(
    '/organizers/:organizerId/suspend',
    ...adminOnly,
    adminValidation.suspendOrganizer,
    validate,
    adminController.suspendOrganizer
);

/**
 * @openapi
 * /api/v1/admin/organizers/{organizerId}/reactivate:
 *   patch:
 *     summary: Reactivate an organizer
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organizer reactivated
 */
router.patch(
    '/organizers/:organizerId/reactivate',
    ...adminOnly,
    adminValidation.reactivateOrganizer,
    validate,
    adminController.reactivateOrganizer
);

/**
 * @openapi
 * /api/v1/admin/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard overview data
 */
router
    .route('/dashboard/overview')
    .get(
        ...adminOnly,
        adminValidation.dashboardOverviewQuery,
        validate,
        adminController.dashboardOverview
    );

/**
 * @openapi
 * /api/v1/admin/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard summary data
 */
router
    .route('/dashboard/summary')
    .get(
        ...adminOnly,
        adminValidation.dashboardSummaryQuery,
        validate,
        adminController.dashboardSummary
    );

/**
 * @openapi
 * /api/v1/admin/dashboard/review-queue:
 *   get:
 *     summary: Get review queue
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Review queue data
 */
router
    .route('/dashboard/review-queue')
    .get(...adminOnly, adminValidation.reviewQueueQuery, validate, adminController.reviewQueue);

/**
 * @openapi
 * /api/v1/admin/analytics/events/{eventId}/tickets-sold:
 *   get:
 *     summary: Get tickets sold for an event
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tickets sold count
 */
router.get(
    '/analytics/events/:eventId/tickets-sold',
    ...adminOnly,
    adminValidation.ticketsSoldByEvent,
    validate,
    adminController.ticketsSoldByEvent
);

/**
 * @openapi
 * /api/v1/admin/analytics/events/{eventId}/revenue:
 *   get:
 *     summary: Get revenue for an event
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Revenue amount
 */
router.get(
    '/analytics/events/:eventId/revenue',
    ...adminOnly,
    adminValidation.revenueByEvent,
    validate,
    adminController.revenueByEvent
);

/**
 * @openapi
 * /api/v1/admin/events:
 *   get:
 *     summary: List all events
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of events
 */
router.get(
    '/events',
    ...adminOnly,
    adminValidation.listEventsQuery,
    validate,
    adminController.listEvents
);

/**
 * @openapi
 * /api/v1/admin/events/{eventId}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 */
router.get(
    '/events/:eventId',
    ...adminOnly,
    adminValidation.eventIdParam,
    validate,
    adminController.getEvent
);

/**
 * @openapi
 * /api/v1/admin/events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 */
router.delete(
    '/events/:eventId',
    ...adminOnly,
    adminValidation.deleteEvent,
    validate,
    adminController.deleteEvent
);

/**
 * @openapi
 * /api/v1/admin/events/{eventId}/restore:
 *   patch:
 *     summary: Restore a deleted event
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event restored successfully
 */
router.patch(
    '/events/:eventId/restore',
    ...adminOnly,
    adminValidation.restoreEvent,
    validate,
    adminController.restoreEvent
);

/**
 * @openapi
 * /api/v1/admin/analytics/active-users:
 *   get:
 *     summary: Get active users count
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Active users count
 */
router.get(
    '/analytics/active-users',
    ...adminOnly,
    adminValidation.activeUsers,
    validate,
    adminController.activeUsers
);

/**
 * @openapi
 * /api/v1/admin/finance/summary:
 *   get:
 *     summary: Get finance summary
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Finance summary data
 */
router.get(
    '/finance/summary',
    ...adminOnly,
    adminValidation.financeSummaryQuery,
    validate,
    adminController.financeSummary
);

/**
 * @openapi
 * /api/v1/admin/finance/payouts/history:
 *   get:
 *     summary: Get payout history
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Payout history list
 */
router.get(
    '/finance/payouts/history',
    ...adminOnly,
    adminValidation.payoutHistoryQuery,
    validate,
    adminController.payoutHistory
);

/**
 * @openapi
 * /api/v1/admin/finance/payouts/process:
 *   post:
 *     summary: Process payouts
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Payouts processed
 */
router.post(
    '/finance/payouts/process',
    ...adminOnly,
    adminValidation.processPayouts,
    validate,
    adminController.processPayouts
);

/**
 * @openapi
 * /api/v1/admin/newsletter/subscribers:
 *   get:
 *     summary: List newsletter subscribers
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of subscribers
 */
router.get(
    '/newsletter/subscribers',
    ...adminOnly,
    adminValidation.listNewsletterSubscribersQuery,
    validate,
    adminController.listNewsletterSubscribers
);

/**
 * @openapi
 * /api/v1/admin/newsletter/broadcast:
 *   post:
 *     summary: Broadcast newsletter
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Newsletter broadcasted
 */
router.post(
    '/newsletter/broadcast',
    ...adminOnly,
    adminValidation.broadcastNewsletter,
    validate,
    adminController.broadcastNewsletter
);

/**
 * @openapi
 * /api/v1/admin/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', ...adminOnly, adminController.listCategories);

/**
 * @openapi
 * /api/v1/admin/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Admin]
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post(
    '/categories',
    ...adminOnly,
    upload.single('image'),
    adminValidation.createCategory,
    validate,
    adminController.createCategory
);

/**
 * @openapi
 * /api/v1/admin/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.put(
    '/categories/:id',
    ...adminOnly,
    upload.single('image'),
    adminValidation.updateCategory,
    validate,
    adminController.updateCategory
);

/**
 * @openapi
 * /api/v1/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
router.delete(
    '/categories/:id',
    ...adminOnly,
    adminValidation.categoryIdParam,
    validate,
    adminController.deleteCategory
);

export default router;
