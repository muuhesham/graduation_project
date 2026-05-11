//@ts-check

import asyncWrapper from '../middlewares/asyncWrapper.js';
import { sendSuccess } from '../utils/response.js';
import organizerDashboardService from '../services/organizerDashboardService.js';
import organizerService from '../services/organizerService.js';
import { OrganizerResource } from './../resources/index.js';
import OrganizerSuccessMessages from '../constants/messages/success/organizer.js';

const organizerDashboardController = {
    getStats: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const [eventStats, ticketStats, orderStats, revenueStats] = await Promise.all([
            organizerDashboardService.getEventsStats(userId),
            organizerDashboardService.getTicketStats(userId),
            organizerDashboardService.getOrderStats(userId),
            organizerDashboardService.getRevenueStats(userId),
        ]);
        return sendSuccess(
            res,
            {
                data: {
                    event: eventStats || {},
                    ticket: ticketStats || {},
                    order: orderStats || {},
                    revenue: revenueStats || {},
                },
            },
            200
        );
    }),

    getAnalytics: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const [eventsData, ticketsData, ordersData] = await Promise.all([
            organizerDashboardService.getEventsData(userId),
            organizerDashboardService.getTicketsData(userId),
            organizerDashboardService.getOrdersData(userId),
        ]);
        return sendSuccess(
            res,
            {
                data: {
                    event: eventsData || {},
                    ticket: ticketsData || {},
                    order: ordersData || {},
                },
            },
            200
        );
    }),

    /**
     * @param {import('express').Request & { user: { id: string }, files: any }} req
     * @param {import('express').Response} res
     */
    updateSettings: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const files = {
            logo: req.files?.logo?.[0],
            cover: req.files?.cover?.[0],
        };

        const organizer = await organizerService.updateSettings(userId, req.body, files);

        return sendSuccess(res, {
            ...OrganizerSuccessMessages.ORGANIZER_SETTINGS_UPDATED,
            organizer: OrganizerResource.make(organizer),
        });

    }),

    /**
     * @param {import('express').Request & { user: { id: string } }} req
     * @param {import('express').Response} res
     */
    requestPhoneOtp: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        await organizerService.requestPhoneOtp(userId);

        return sendSuccess(res, OrganizerSuccessMessages.ORGANIZER_CONTACT_PHONE_VERIFICATION_SENT);
    }),

    /**
     * @param {import('express').Request & { user: { id: string } }} req
     * @param {import('express').Response} res
     */
    verifyPhoneOtp: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const { otp } = req.body;

        const organizer = await organizerService.verifyPhoneOtp(userId, otp);

        return sendSuccess(res, {
            ...OrganizerSuccessMessages.ORGANIZER_CONTACT_PHONE_VERIFIED,
            organizer: OrganizerResource.make(organizer),
        });
    }),
};

export default organizerDashboardController;
