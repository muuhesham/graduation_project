import { param, body } from 'express-validator';
import {Filter} from 'bad-words';

const filter = new Filter();

const reviewValidation = {
    create: [
        param('eventId')
            .exists()
            .withMessage('Event ID is required')
            .toInt(10)
            .isInt({ gt: 0 })
            .withMessage('Event ID must be a positive integer'),

        body('rating')
            .exists()
            .withMessage('Rating is required')
            .toInt(10)
            .isInt({ min: 1, max: 5 })
            .withMessage('Rating must be a number between 1 and 5'),

        body('comment')
            .optional()
            .trim()
            .isString()
            .withMessage('Comment must be a string')
            .isLength({ max: 500 })
            .withMessage('Comment too long')
            .custom((value) => {
                if (filter.isProfane(value)) {
                    throw new Error('Comment contains inappropriate language');
                }
                return true;
            }),
    ],

    update: [
        param('id')
            .exists()
            .withMessage('Review ID is required')
            .toInt(10)
            .isInt({ gt: 0 })
            .withMessage('Review ID must be a positive integer'),

        body('rating')
            .optional()
            .toInt(10)
            .isInt({ min: 1, max: 5 })
            .withMessage('Rating must be a number between 1 and 5'),

        body('comment')
            .optional()
            .trim()
            .isString()
            .withMessage('Comment must be a string')
            .isLength({ max: 500 })
            .withMessage('Comment too long')
            .custom((value) => {
                if (filter.isProfane(value)) {
                    throw new Error('Comment contains inappropriate language');
                }
                return true;
            }),
    ],

    delete: [
        param('id')
            .exists()
            .withMessage('Review ID is required')
            .toInt(10)
            .isInt({ gt: 0 })
            .withMessage('Review ID must be a positive integer'),
    ],

    getByEventId: [
        param('eventId')
            .exists()
            .withMessage('Event ID is required')
            .toInt(10)
            .isInt({ gt: 0 })
            .withMessage('Event ID must be a positive integer'),

        param('page')
            .optional()
            .toInt(10)
            .isInt({ gt: 0 })
            .withMessage('Page must be a positive integer'),

        param('limit')
            .optional()
            .toInt(10)
            .isInt({ min: 1, max: 50 })
            .withMessage('Limit must be between 1 and 50'),
    ],

    getUserEventReview: [
        param('eventId')
            .exists()
            .withMessage('Event ID is required')
            .toInt(10)
            .isInt({ gt: 0 })
            .withMessage('Event ID must be a positive integer'),
    ],
};

export default reviewValidation;
