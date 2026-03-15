import asyncHandler from "../middlewares/asyncWrapper.js";
import { sendSuccess } from "../utils/response.js";
import ticketService from "../services/ticketService.js";

const ticketController = {
    getSingleTicket: asyncHandler(async (req, res) => {
        const userId = req.user.id
        const ticketId = req.params.id;
        const ticket = await ticketService.getSingleTicket({ticketId, userId});
        
        return sendSuccess(res, ticket, 200);
    }),
};

export default ticketController;