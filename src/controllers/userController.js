import asyncWrapper from '../middlewares/asyncWrapper.js';
import { sendSuccess, sendFail, sendError } from '../utils/response.js';
import userService from '../services/userService.js';

const userController = {
    upgradeToOrganizer: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const result = await userService.upgradeToOrganizer(userId);
        
        if (result.status === 'fail') {
            return sendFail(res, result.data);
        }
        
        return sendSuccess(res, result.data, 200);
    }),

    getUserTickets: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const tickets = await userService.getUserTickets(userId);

        if(tickets.length === 0) {
            return sendSuccess(res, { data: tickets , message: 'No tickets found for this user' }, 200);
        }

        return sendSuccess(res, tickets, 200);
    }),

};

export default userController;
