import { param } from 'express-validator';

const eventValidation = {
    show: [param('organizerId').notEmpty().isUUID(4), param('eventSlug').notEmpty().isSlug()],
};

export default eventValidation;
