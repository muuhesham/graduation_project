//@ts-check

import { Router } from 'express';

import adminController from './../controllers/adminController.js';
import adminValidation from './../validations/adminValidation.js';

import { authLimiter } from './../middlewares/rateLimiter.js';
import validate from './../middlewares/validate.js';
import auth from './../middlewares/auth.js';
import authorize from './../middlewares/authorize.js';
import { restrictToLocalhost } from './../middlewares/network.js';

/** @type {Router} */
const router = Router();
const authLimiterHandler = /** @type {import('express').RequestHandler} */ (authLimiter);
const adminOnly = [auth, authorize.isAdmin];

router.post(
    '/auth/register',
    restrictToLocalhost,
    adminValidation.register,
    validate,
    adminController.register
);

router.post(
    '/auth/login',
    authLimiterHandler,
    adminValidation.login,
    validate,
    adminController.login
);

router.post('/auth/refresh', adminValidation.refreshToken, validate, adminController.refreshToken);

router.post('/auth/logout', adminValidation.logout, validate, adminController.logout);

router.delete(
    '/users/:userId',
    ...adminOnly,
    adminValidation.deleteUser,
    validate,
    adminController.deleteUser
);

router.patch(
    '/users/:userId/restore',
    ...adminOnly,
    adminValidation.restoreUser,
    validate,
    adminController.restoreUser
);

router
    .route('/users')
    .get(...adminOnly, adminValidation.listUsersQuery, validate, adminController.listUsers);

router.get(
    '/users/:userId',
    ...adminOnly,
    adminValidation.userIdParam,
    validate,
    adminController.getUser
);

router.get(
    '/organizers',
    ...adminOnly,
    adminValidation.listOrganizersQuery,
    validate,
    adminController.listOrganizers
);

router.get(
    '/organizers/:organizerId',
    ...adminOnly,
    adminValidation.organizerIdParam,
    validate,
    adminController.getOrganizer
);

router.patch(
    '/organizers/:organizerId/approve',
    ...adminOnly,
    adminValidation.organizerIdParam,
    validate,
    adminController.approveOrganizer
);

router.patch(
    '/organizers/:organizerId/reject',
    ...adminOnly,
    adminValidation.rejectOrganizer,
    validate,
    adminController.rejectOrganizer
);

router.patch(
    '/organizers/:organizerId/suspend',
    ...adminOnly,
    adminValidation.suspendOrganizer,
    validate,
    adminController.suspendOrganizer
);

router.patch(
    '/organizers/:organizerId/reactivate',
    ...adminOnly,
    adminValidation.reactivateOrganizer,
    validate,
    adminController.reactivateOrganizer
);

router
    .route('/dashboard/overview')
    .get(
        ...adminOnly,
        adminValidation.dashboardOverviewQuery,
        validate,
        adminController.dashboardOverview
    );

router
    .route('/dashboard/summary')
    .get(
        ...adminOnly,
        adminValidation.dashboardSummaryQuery,
        validate,
        adminController.dashboardSummary
    );

router
    .route('/dashboard/review-queue')
    .get(...adminOnly, adminValidation.reviewQueueQuery, validate, adminController.reviewQueue);

router.get(
    '/analytics/events/:eventId/tickets-sold',
    ...adminOnly,
    adminValidation.ticketsSoldByEvent,
    validate,
    adminController.ticketsSoldByEvent
);

router.get(
    '/analytics/events/:eventId/revenue',
    ...adminOnly,
    adminValidation.revenueByEvent,
    validate,
    adminController.revenueByEvent
);

router.get(
    '/events',
    ...adminOnly,
    adminValidation.listEventsQuery,
    validate,
    adminController.listEvents
);

router.get(
    '/events/:eventId',
    ...adminOnly,
    adminValidation.eventIdParam,
    validate,
    adminController.getEvent
);

router.delete(
    '/events/:eventId',
    ...adminOnly,
    adminValidation.deleteEvent,
    validate,
    adminController.deleteEvent
);

router.patch(
    '/events/:eventId/restore',
    ...adminOnly,
    adminValidation.restoreEvent,
    validate,
    adminController.restoreEvent
);

router.get(
    '/analytics/active-users',
    ...adminOnly,
    adminValidation.activeUsers,
    validate,
    adminController.activeUsers
);

router.get(
    '/finance/summary',
    ...adminOnly,
    adminValidation.financeSummaryQuery,
    validate,
    adminController.financeSummary
);
router.get(
    '/finance/payouts/history',
    ...adminOnly,
    adminValidation.payoutHistoryQuery,
    validate,
    adminController.payoutHistory
);

router.post(
    '/finance/payouts/process',
    ...adminOnly,
    adminValidation.processPayouts,
    validate,
    adminController.processPayouts
);

export default router;
