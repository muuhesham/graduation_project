//@ts-check

import { param, query, body } from 'express-validator';

import OrganizerVerficiationStatus from './../constants/enums/organizerVerificationStatus.js';
import OrganizerStatus from './../constants/enums/organizerStatus.js';
import EventType from './../constants/enums/eventType.js';
import EventMode from './../constants/enums/eventMode.js';
import Gender from './../constants/enums/userGender.js';
import Language from './../constants/enums/userLanguage.js';

/**
 * @param {{ defaultPage?: number, defaultLimit?: number }} [defaults]
 */
const paginationQuery = ({ defaultPage = 1, defaultLimit = 20 } = {}) => [
    query('page')
        .optional()
        .default(defaultPage)
        .isInt({ min: 1 })
        .withMessage('page must be a positive integer')
        .toInt(),
    query('limit')
        .optional()
        .default(defaultLimit)
        .isInt({ min: 1 })
        .withMessage('limit must be a positive integer')
        .toInt(),
];

/**
 * @typedef {import('express-validator').ValidationChain[]} ValidationChainArray
 */

class AdminValidation {
    /**
     * @type {ValidationChainArray}
     */
    eventIdParam = [
        param('eventId')
            .trim()
            .notEmpty()
            .withMessage('eventId is required')
            .bail()
            .isInt({ min: 1 })
            .withMessage('eventId must be a valid positive integer')
            .toInt(),
    ];

    /**
     * @type {ValidationChainArray}
     */
    userIdParam = [
        param('userId')
            .trim()
            .notEmpty()
            .withMessage('userId is required')
            .bail()
            .isUUID()
            .withMessage('userId must be a valid UUID'),
    ];

    /**
     * @type {ValidationChainArray}
     */
    register = [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .bail()
            .isLength({ min: 3, max: 100 })
            .withMessage('Name must be between 3 and 100 characters'),

        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .bail()
            .isEmail()
            .withMessage('Invalid email format')
            .toLowerCase(),

        body('password')
            .isString()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ];

    /**
     * @type {ValidationChainArray}
     */
    login = [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .bail()
            .isEmail()
            .withMessage('Invalid email format')
            .toLowerCase(),

        body('password')
            .isString()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ];

    /**
     * @type {ValidationChainArray}
     */
    refreshToken = [body('refreshToken').trim().notEmpty().withMessage('refreshToken is required')];

    /**
     * @type {ValidationChainArray}
     */
    logout = this.refreshToken;

    /**
     * @type {ValidationChainArray}
     */
    deleteUser = [...this.userIdParam];

    /**
     * @type {ValidationChainArray}
     */
    restoreUser = [...this.userIdParam];

    /**
     * @type {ValidationChainArray}
     */
    organizerIdParam = [
        param('organizerId')
            .trim()
            .notEmpty()
            .withMessage('organizerId is required')
            .bail()
            .isUUID()
            .withMessage('organizerId must be a valid UUID'),
    ];

    /**
     * @type {ValidationChainArray}
     */
    rejectOrganizer = [
        ...this.organizerIdParam,
        body('reason')
            .trim()
            .notEmpty()
            .withMessage('reason is required')
            .bail()
            .isLength({ min: 3, max: 500 })
            .withMessage('reason must be between 3 and 500 characters'),
    ];

    /**
     * @type {ValidationChainArray}
     */
    suspendOrganizer = [
        ...this.organizerIdParam,
        body('reason')
            .trim()
            .notEmpty()
            .withMessage('reason is required')
            .bail()
            .isLength({ min: 3, max: 500 })
            .withMessage('reason must be between 3 and 500 characters'),
    ];

    /**
     * @type {ValidationChainArray}
     */
    reactivateOrganizer = [...this.organizerIdParam];

    /**
     * @type {ValidationChainArray}
     */
    ticketsSoldByEvent = [...this.eventIdParam];

    /**
     * @type {ValidationChainArray}
     */
    revenueByEvent = [...this.eventIdParam];

    /**
     * @type {ValidationChainArray}
     */
    deleteEvent = [...this.eventIdParam];

    /**
     * @type {ValidationChainArray}
     */
    restoreEvent = [...this.eventIdParam];

    /**
     * @type {ValidationChainArray}
     */
    activeUsers = [
        query('days')
            .optional()
            .isInt({ min: 1 })
            .withMessage('days must be a positive integer')
            .toInt(),
    ];

    /**
     * @type {ValidationChainArray}
     */
    dashboardSummaryQuery = [
        query('days')
            .optional()
            .default(30)
            .isInt({ min: 1 })
            .withMessage('days must be a positive integer')
            .toInt(),
    ];

    /**
     * @type {ValidationChainArray}
     */
    reviewQueueQuery = paginationQuery({ defaultLimit: 10 });

    /**
     * @type {ValidationChainArray}
     */
    dashboardOverviewQuery = [...this.dashboardSummaryQuery, ...this.reviewQueueQuery];

    /**
     * @type {ValidationChainArray}
     */
    listUsersQuery = [
        ...paginationQuery(),
        query('gender')
            .optional()
            .isIn(Object.values(Gender))
            .withMessage(`gender must be ${Object.values(Gender).join(', ')}`),
        query('isVerified')
            .optional()
            .isBoolean()
            .withMessage('isVerified must be true or false')
            .toBoolean(),
        query('languagePreference')
            .optional()
            .isIn(Object.values(Language))
            .withMessage(`languagePreference must be ${Object.values(Language).join(', ')}`),
        query('isCompleted')
            .optional()
            .isBoolean()
            .withMessage('isCompleted must be true or false')
            .toBoolean(),
        query('createdAt')
            .optional()
            .isISO8601()
            .withMessage('createdAt must be a valid ISO date')
            .bail()
            .customSanitizer((value) => {
                const start = new Date(value);
                start.setHours(0, 0, 0, 0);

                const end = new Date(start);
                end.setDate(end.getDate() + 1);

                return {
                    gte: start,
                    lt: end,
                };
            }),
    ];

    /**
     * @type {ValidationChainArray}
     */
    listOrganizersQuery = [
        ...paginationQuery(),
        query('status')
            .optional()
            .isIn(Object.values(OrganizerStatus))
            .withMessage(`status must be ${Object.values(OrganizerStatus).join(', ')}`),
        query('verificationStatus')
            .optional()
            .isIn(Object.values(OrganizerVerficiationStatus))
            .withMessage(
                `verificationStatus must be ${Object.values(OrganizerVerficiationStatus).join(', ')}`
            ),
    ];

    /**
     * @type {ValidationChainArray}
     */
    listEventsQuery = [
        ...paginationQuery(),
        query('q')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('q must be between 1 and 100 characters'),
        query('type')
            .optional()
            .isIn(Object.values(EventType))
            .withMessage(`type must be ${Object.values(EventType).join(', ')}`),
        query('mode')
            .optional()
            .isIn(Object.values(EventMode))
            .withMessage(`mode must be ${Object.values(EventMode).join(', ')}`),
        query('organizerId')
            .optional()
            .trim()
            .isUUID()
            .withMessage('organizerId must be a valid UUID'),
        query('venueId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('venueId must be a valid positive integer')
            .toInt(),
        query('categoryId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('categoryId must be a valid positive integer')
            .toInt(),
        query('hasSeatMap')
            .optional()
            .isBoolean()
            .withMessage('hasSeatMap must be true or false')
            .toBoolean(),
    ];

    /**
     * @type {ValidationChainArray}
     */
    processPayouts = [
        body('days')
            .optional()
            .default(30)
            .isInt({ min: 1 })
            .withMessage('days must be a positive integer')
            .toInt(),
    ];

    /**
     * @type {ValidationChainArray}
     */
    financeSummaryQuery = [
        query('days')
            .optional()
            .default(30)
            .isInt({ min: 1 })
            .withMessage('days must be a positive integer')
            .toInt(),
    ];

    /**
     * @type {ValidationChainArray}
     */
    payoutHistoryQuery = paginationQuery();
}

export default new AdminValidation();
export { AdminValidation };
