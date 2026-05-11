//@ts-check

import asyncWrapper from '../middlewares/asyncWrapper.js';
import { sendSuccess } from '../utils/response.js';
import organizerService from '../services/organizerService.js';
import { EventResource, OrganizerPublicResource } from './../resources/index.js';

const organizerController = {
    createEvent: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const banner = req.file;

        let {
            priceTiers,
            seatsData,
            tickets,
            sessions,
            eventRules,
            tags,
        } = req.body;

        if (priceTiers && typeof priceTiers === 'string') {
            priceTiers = JSON.parse(priceTiers);
        }

        if (seatsData && typeof seatsData === 'string') {
            seatsData = JSON.parse(seatsData);
        }

        if (tickets && typeof tickets === 'string') {
            tickets = JSON.parse(tickets);
        }

        if (sessions && typeof sessions === 'string') {
            sessions = JSON.parse(sessions);
        }

        if (eventRules && typeof eventRules === 'string') {
            eventRules = JSON.parse(eventRules);
        }

        if (tags && typeof tags === 'string') {
            tags = JSON.parse(tags);
        }

        const event = await organizerService.createOrganizerEvent(userId, {
            ...req.body,
            priceTiers,
            seatsData,
            tickets,
            sessions,
            eventRules,
            tags,
            banner,
        });

        return sendSuccess(res, EventResource.make(event), 201);
    }),

    deleteEvent: asyncWrapper(async (req, res) => {
        const eventId = req.params.eventId;
        const userId = req.user.id;

        const result = await organizerService.deleteOrganizerEvent(userId, eventId);

        return sendSuccess(res, EventResource.make(result), 200);
    }),

    updateEvent: asyncWrapper(async (req, res) => {
        const eventId = req.params.eventId;
        const userId = req.user.id;
        const banner = req.file;

        const event = await organizerService.updateOrganizerEvent(userId, eventId, {
            ...req.body,
            banner,
        });

        return sendSuccess(res, EventResource.make(event), 200);
    }),

    listEvents: asyncWrapper(async (req, res) => {
        const userId = req.user.id;

        const result = await organizerService.listOrganizerEvents(userId);

        return sendSuccess(res, EventResource.paginate(result), 200);
    }),

    cancelEvent: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const { eventId } = req.params;

        await organizerService.cancelOrganizerEvent(userId, parseInt(eventId, 10));

        return sendSuccess(
            res,
            { message: 'Event cancelled & refunds processed successfully.' },
            200
        );
    }),

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    getPublicProfile: asyncWrapper(async (req, res) => {
        const { id } = req.params;
        const currentUserId = /** @type {any} */ (req).user?.id;

        const organizer = await organizerService.getPublicProfile(id, currentUserId);

        return sendSuccess(res, { organizer: OrganizerPublicResource.make(organizer) });
    }),
};

export default organizerController;
