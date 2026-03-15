import asyncWrapper from '../middlewares/asyncWrapper.js';
import { sendSuccess, sendFail} from '../utils/response.js';
import userService from '../services/userService.js';
import ticketService from '../services/ticketService.js';

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
        const tickets = await ticketService.getUserTickets({userId});

        return sendSuccess(res, {tickets}, 200);
    getInterestedEvents: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const result = await userService.getInterestedEvents({userId});

        return sendSuccess(res, { events: result }, 200);
    }),

};

export default userController;
