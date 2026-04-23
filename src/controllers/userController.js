//@ts-check

import asyncWrapper from '../middlewares/asyncWrapper.js';
import { sendSuccess } from '../utils/response.js';
import userService from '../services/userService.js';
import organizerService from '../services/organizerService.js';
import ticketService from '../services/ticketService.js';
import fileService from '../services/fileService.js';
import OrganizerSuccessMessages from '../constants/messages/success/organizer.js';

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
         * @param {UpgradeToOrganizerWithFileRequest} req
         * @param {Response} res
         * @returns {Promise<Response>}
         */
        async (req, res) => {
            const userId = req.user.id;

            if (req.body.organizerType && !req.body.type) {
                req.body.type = req.body.organizerType;
            }

            if (req.file) {
                const organizerDocumentsFolder = `user/${userId}/organizer/documents`;
                const savedOfficialDocument = await fileService.save(
                    req.file,
                    organizerDocumentsFolder
                );

                if (savedOfficialDocument) {
                    req.body.officialDocumentsDisk = savedOfficialDocument.disk;
                    req.body.officialDocumentsPath = savedOfficialDocument.path;
                }
            }

            const result = await userService.upgradeToOrganizer(userId, req.body);

            return sendSuccess(res, result, 201);
        }
    ),

    sendOrganizerContactEmailVerification: asyncWrapper(
        /**
         * @param {AuthenticatedRequestNoBody} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            await organizerService.requestOrganizerContactEmailVerification(userId);

            return sendSuccess(
                res,
                OrganizerSuccessMessages.ORGANIZER_CONTACT_EMAIL_VERIFICATION_SENT,
                200
            );
        }
    ),

    resendOrganizerContactEmailVerification: asyncWrapper(
        /**
         * @param {AuthenticatedRequestNoBody} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            await organizerService.resendOrganizerContactEmailVerification(userId);

            return sendSuccess(
                res,
                OrganizerSuccessMessages.ORGANIZER_CONTACT_EMAIL_VERIFICATION_RESENT,
                200
            );
        }
    ),

    checkWallet: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const result = await userService.checkWallet({userId});

        return sendSuccess(res, { balance: result }, 200);
    }),

    verifyOrganizerContactEmail: asyncWrapper(
        /**
         * @param {VerifyOrganizerContactEmailRequest} req
         * @param {Response} res
         */
        async (req, res) => {
            const userId = req.user.id;
            await organizerService.verifyOrganizerContactEmail(userId, req.body);

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
};

export default userController;
