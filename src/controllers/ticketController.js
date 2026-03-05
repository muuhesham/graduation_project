import asyncHandler from "../middlewares/asyncWrapper.js";
import { sendSuccess, sendFail } from "../utils/response.js";
import ticketService from "../services/ticketService.js";

const ticketController = {
    getSingleTicket: asyncHandler(async (req, res) => {
        const userId = req.user.id
        const ticketId = req.params.id;

        const ticket = await ticketService.getSingleTicket(ticketId, userId);
        
        if (!ticket) {
            return sendFail(res, { error: 'Ticket page not found' }, 404);
        }

        return sendSuccess(res, ticket, 200);
    }),
};

export default ticketController;