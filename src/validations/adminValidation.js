//@ts-check

import { body, param, query } from 'express-validator';
import OrganizerVerficiationStatus from './../constants/enums/organizerVerificationStatus.js';
import OrganizerStatus from './../constants/enums/organizerStatus.js';

class AdminValidation {
    register = [
        body('name')
            .isString()
            .withMessage('Name must be a string')
            .trim()
            .notEmpty()
            .withMessage('Name is required'),
        body('email')
            .isEmail()
            .withMessage('Invalid email address')
            .normalizeEmail()
            .notEmpty()
            .withMessage('Email is required'),
        body('password')
            .isString()
            .withMessage('Password must be a string')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .notEmpty()
            .withMessage('Password is required'),
    ];

    login = [
        body('email')
            .isEmail()
            .withMessage('Invalid email address')
            .normalizeEmail()
            .notEmpty()
            .withMessage('Email is required'),
        body('password').isString().notEmpty().withMessage('Password is required'),
    ];

    refreshToken = [body('refreshToken').isString().notEmpty().withMessage('Refresh token is required')];

    logout = [body('refreshToken').isString().notEmpty().withMessage('Refresh token is required')];

    deleteUser = [param('userId').isUUID().withMessage('Invalid user ID')];

    restoreUser = [param('userId').isUUID().withMessage('Invalid user ID')];

    userIdParam = [param('userId').isUUID().withMessage('Invalid user ID')];

    organizerIdParam = [param('organizerId').isUUID().withMessage('Invalid organizer ID')];

    eventIdParam = [param('eventId').toInt().isInt().withMessage('Invalid event ID')];

    deleteEvent = [param('eventId').toInt().isInt().withMessage('Invalid event ID')];

    restoreEvent = [param('eventId').toInt().isInt().withMessage('Invalid event ID')];

    listEventsQuery = [
        query('page').optional().toInt().isInt({ min: 1 }).default(1),
        query('limit').optional().toInt().isInt({ min: 1, max: 100 }).default(20),
        query('q').optional().isString().trim(),
        query('type').optional().isIn(['ticketed', 'free']),
        query('mode').optional().isIn(['single', 'recurring']),
        query('status').optional().isIn(['active', 'cancelled']),
        query('withTrashed').optional().toBoolean(),
        query('organizerId').optional().isUUID(),
        query('venueId').optional().toInt().isInt(),
        query('categoryId').optional().toInt().isInt(),
        query('hasSeatMap').optional().toBoolean(),
    ];

    listUsersQuery = [
        query('page').optional().toInt().isInt({ min: 1 }).default(1),
        query('limit').optional().toInt().isInt({ min: 1, max: 100 }).default(20),
        query('gender').optional().isIn(['male', 'female']),
        query('isVerified').optional().toBoolean(),
        query('languagePreference').optional().isIn(['en', 'ar']),
        query('isCompleted').optional().toBoolean(),
        query('createdAt').optional().isISO8601(),
    ];

    listOrganizersQuery = [
        query('page').optional().toInt().isInt({ min: 1 }).default(1),
        query('limit').optional().toInt().isInt({ min: 1, max: 100 }).default(20),
        query('status').optional().isIn(Object.values(OrganizerStatus)),
        query('verificationStatus').optional().isIn(Object.values(OrganizerVerficiationStatus)),
    ];

    dashboardSummaryQuery = [query('days').optional().toInt().isInt({ min: 1 }).default(30)];

    reviewQueueQuery = [
        query('page').optional().toInt().isInt({ min: 1 }).default(1),
        query('limit').optional().toInt().isInt({ min: 1, max: 100 }).default(20),
    ];

    dashboardOverviewQuery = [
        query('days').optional().toInt().isInt({ min: 1 }).default(30),
        query('page').optional().toInt().isInt({ min: 1 }).default(1),
        query('limit').optional().toInt().isInt({ min: 1, max: 100 }).default(20),
    ];

    rejectOrganizer = [
        param('organizerId').isUUID().withMessage('Invalid organizer ID'),
        body('reason')
            .isString()
            .withMessage('Reason must be a string')
            .trim()
            .notEmpty()
            .withMessage('Rejection reason is required'),
    ];

    suspendOrganizer = [
        param('organizerId').isUUID().withMessage('Invalid organizer ID'),
        body('reason')
            .isString()
            .withMessage('Reason must be a string')
            .trim()
            .notEmpty()
            .withMessage('Suspension reason is required'),
    ];

    reactivateOrganizer = [param('organizerId').isUUID().withMessage('Invalid organizer ID')];

    ticketsSoldByEvent = [param('eventId').toInt().isInt().withMessage('Invalid event ID')];

    revenueByEvent = [param('eventId').toInt().isInt().withMessage('Invalid event ID')];

    activeUsers = [query('days').optional().toInt().isInt({ min: 1 }).default(30)];

    processPayouts = [body('days').optional().toInt().isInt({ min: 1 }).default(30)];

    financeSummaryQuery = [query('days').optional().toInt().isInt({ min: 1 }).default(30)];

    payoutHistoryQuery = [
        query('page').optional().toInt().isInt({ min: 1 }).default(1),
        query('limit').optional().toInt().isInt({ min: 1, max: 100 }).default(20),
    ];

    listNewsletterSubscribersQuery = [
        query('page').optional().toInt().isInt({ min: 1 }).default(1),
        query('limit').optional().toInt().isInt({ min: 1, max: 100 }).default(20),
        query('q').optional().isString().trim(),
    ];

    broadcastNewsletter = [
        body('subject')
            .isString()
            .withMessage('Subject must be a string')
            .trim()
            .notEmpty()
            .withMessage('Subject is required'),
        body('content')
            .isString()
            .withMessage('Content must be a string')
            .trim()
            .notEmpty()
            .withMessage('Content is required'),
    ];

    categoryIdParam = [param('id').toInt().isInt().withMessage('Invalid category ID')];

    createCategory = [
        body('name')
            .isString()
            .withMessage('Name must be a string')
            .trim()
            .notEmpty()
            .withMessage('Name is required'),
        body('image').custom((value, { req }) => {
            if (!req.file) {
                throw new Error('Image is required');
            }
            return true;
        }),
    ];

    updateCategory = [
        param('id').toInt(),
        body('name')
            .optional()
            .isString()
            .withMessage('Name must be a string')
            .trim()
            .notEmpty()
            .withMessage('Name cannot be empty'),
        body('image').optional(),
    ];
}

export default new AdminValidation();
