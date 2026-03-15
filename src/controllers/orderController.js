import asyncWrapper from '../middlewares/asyncWrapper.js';
import { sendFail, sendSuccess } from '../utils/response.js';
import orderService from '../services/orderService.js';

const orderController = {
    status: asyncWrapper(async (req, res) => {
        const { id: userId } = req.user;
        const { id } = req.params;

        const status = await orderService.status(id, userId);

        if (!status) {
            return sendFail(res, { message: 'Order not found' }, 404);
        }

        return sendSuccess(res, status);
    }),

    getOrderTickets: asyncWrapper(async (req, res) => {
        const userId = req.user.id;
        const orderId = req.params.id;
        const tickets = await orderService.getOrderTickets({orderId, userId});

        return sendSuccess(res, tickets, 200);
    }),
};

export default orderController;
