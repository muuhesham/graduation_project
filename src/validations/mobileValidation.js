import { body } from 'express-validator';

const mobileValidations = {
    login: [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email cannot be empty')
            .isLength({ max: 255 })
            .withMessage('Email cannot be that long')
            .isEmail()
            .withMessage('Invalid email format'),

        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password cannot be empty')
            .isLength({ min: 8, max: 255 })
            .withMessage('Password must be at least 8 characters long'),
    ],

    scan: [
        body('ticketId')
            .trim()
            .notEmpty()
            .withMessage('Ticket ID cannot be empty')
            .isUUID()
            .withMessage('Invalid ticket ID format'),
    ],
};

export default mobileValidations;
