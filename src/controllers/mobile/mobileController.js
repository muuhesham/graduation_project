import mobileService from '../../services/mobile/mobileService.js';
import { sendSuccess } from '../../utils/response.js';
import asyncHandler from '../../middlewares/asyncWrapper.js';

const mobileController = {
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const result = await mobileService.login({ email, password });

        return sendSuccess(res, result, 200);
    }),

    scan: asyncHandler(async (req, res) => {
        const { ticketId } = req.body;
        const organizerId = req.user.id;
        const result = await mobileService.scanTicket({ ticketId, organizerId });

        return sendSuccess(res, result, 200);
    }),

};

export default mobileController;
