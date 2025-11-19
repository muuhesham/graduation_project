import { sendSuccess } from '../utils/response.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import eventService from '../services/eventService.js';

const eventController = {
    show: asyncWrapper(async (req, res) => {
        const { organizerId, eventSlug: slug } = req.params;

        const result = await eventService.show(organizerId, slug);
        sendSuccess(res, { event: result }, 200);
    }),
};

export default eventController;
