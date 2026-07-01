import express from 'express';
import validate from '../middlewares/validate.js';
import auth from '../middlewares/auth.js';
import { publicLimiter } from '../middlewares/rateLimiter.js';
import orderValidation from '../validations/orderValidation.js';
import orderController from '../controllers/orderController.js';

const Router = express.Router();

/**
 * @openapi
 * /api/v1/orders/{id}/status:
 *   get:
 *     summary: Get order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order status retrieved successfully
 */
Router.get(
    '/:id/status',
    publicLimiter,
    auth,
    orderValidation.status,
    validate,
    orderController.status
);

Router.get('/:id/tickets', auth, orderValidation.getOrderTickets, validate, orderController.getOrderTickets);

export default Router;
