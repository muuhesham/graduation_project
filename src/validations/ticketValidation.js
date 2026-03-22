import { param } from 'express-validator';

const ticketValidation = {
    getSingleTicket: [
        param('id')
            .notEmpty()
            .withMessage('Ticket ID is required')
            .isUUID()
            .withMessage('Invalid Ticket ID format'),
    ],
};

export default ticketValidation;