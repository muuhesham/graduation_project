import { sendSuccess, sendFail } from '../utils/response.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import eventService from '../services/eventService.js';

const eventController = {
    show: asyncWrapper(async (req, res) => {
        const { id } = req.params;

        const result = await eventService.show(id);

        if (!result || result.status === 'fail') {
            return sendFail(res, result.data, result.statusCode || 400);
        }
        return sendSuccess(res, { event: result }, 200);
    }),

    checkout: asyncWrapper(async (req, res) => {
        const { id: userId, email: userEmail } = req.user;
        const { id } = req.params;
        const { tickets } = req.body;

        const result = await eventService.checkout(id, userId, userEmail, tickets);

        return sendSuccess(res, result.data, 201);
    }),

    addToInterested: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const eventId = parseInt(req.params.id);

        const result = await eventService.addToInterested(userId, eventId);

        if(!result || result.status === 'fail') {
            return sendFail(res, result.data, 400);
        }

        return sendSuccess(res, { message: 'Event added to your interested list' }, 200);     
    }),

    removeFromInterested: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const eventId = parseInt(req.params.id);

        const result = await eventService.removeFromInterested(userId, eventId);

        if(!result || result.status === 'fail') {
            return sendFail(res, result.data, 400);
        }

        return sendSuccess(res, { message: 'Event removed from your interested list' }, 200);
    }),

};

export default eventController;
