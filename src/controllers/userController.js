//@ts-check

import asyncWrapper from '../middlewares/asyncWrapper.js';
import { sendSuccess } from '../utils/response.js';
import userService from '../services/userService.js';
import organizerService from '../services/organizerService.js';
import ticketService from '../services/ticketService.js';

import { OrganizerResource } from './../resources/index.js';

import OrganizerSuccessMessages from './../constants/messages/success/organizer.js';

/** @typedef {import('express').Response} Response */
/** @typedef {import('./../types/express').UpgradeToOrganizerWithFileRequest} UpgradeToOrganizerWithFileRequest */
/** @typedef {import('./../types/express/request.types.js').AuthenticatedRequest<Record<string, never>>} AuthenticatedRequestNoBody */
/** @typedef {{ otp: string }} VerifyOrganizerContactEmailBody */
/** @typedef {import('./../types/express/request.types.js').AuthenticatedRequest<VerifyOrganizerContactEmailBody>} VerifyOrganizerContactEmailRequest */

const userController = {
    /**
     * @route PATCH /api/v1/user/upgrade-to-organizer
     * @description Upgrade a user to an organizer
     */
    upgradeToOrganizer: asyncWrapper(
        /**
         * @param {any} req
         * @param {Response} res
         * @returns {Promise<Response>}
         */
        async (req, res) => {
            const userId = req.user.id;

            const organizer = await userService.upgradeToOrganizer(userId, req.body, req.files);

            return sendSuccess(
                res,
                {
                    organizer: OrganizerResource.make(organizer),
                },
                201
            );
        }    ),

    resendOrganizerEmailOtp: asyncWrapper(
        /**
         * @param {AuthenticatedRequestNoBody} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            await organizerService.requestEmailOtp(userId);

            return sendSuccess(
                res,
                OrganizerSuccessMessages.ORGANIZER_CONTACT_EMAIL_VERIFICATION_SENT
            );
        }
    ),

    getOrganizerStatus: asyncWrapper(
        /**
         * @param {AuthenticatedRequestNoBody} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            const organizer = await organizerService.getByUserId(userId);

            return sendSuccess(
                res,
                {
                    organizer: OrganizerResource.make(organizer),
                },
                200
            );
        }
    ),

    checkWallet: asyncWrapper(
        /**
         * @param {AuthenticatedRequestNoBody} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            const result = await userService.checkWallet({ userId });

            return sendSuccess(res, { balance: result }, 200);
        }
    ),

    verifyOrganizerContactEmail: asyncWrapper(
        /**
         * @param {VerifyOrganizerContactEmailRequest} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            await organizerService.verifyContactEmail(userId, req.body);

            return sendSuccess(res, OrganizerSuccessMessages.ORGANIZER_CONTACT_EMAIL_VERIFIED, 200);
        }
    ),

    getUserTickets: asyncWrapper(
        /**
         * @param {AuthenticatedRequestNoBody} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            const tickets = await ticketService.getUserTickets({ userId });

            return sendSuccess(res, { tickets }, 200);
        }
    ),

    getInterestedEvents: asyncWrapper(
        /**
         * @param {AuthenticatedRequestNoBody} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            const result = await userService.getInterestedEvents({ userId });

            return sendSuccess(res, { events: result }, 200);
        }
    ),

    followOrganizer: asyncWrapper(
        /**
         * @param {import('express').Request & { user: { id: string }, params: { organizerId: string } }} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            const { organizerId } = req.params;

            await userService.followOrganizer(userId, organizerId);

            return sendSuccess(res, OrganizerSuccessMessages.ORGANIZER_FOLLOWED);
        }
    ),

    unfollowOrganizer: asyncWrapper(
        /**
         * @param {import('express').Request & { user: { id: string }, params: { organizerId: string } }} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            const { organizerId } = req.params;

            await userService.unfollowOrganizer(userId, organizerId);

            return sendSuccess(res, OrganizerSuccessMessages.ORGANIZER_UNFOLLOWED);
        }
    ),
};

export default userController;
