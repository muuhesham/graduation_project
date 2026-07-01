import express from 'express';
import paymentController from '../controllers/paymentController.js';

const Router = express.Router();

/**
 * @openapi
 * /api/v1/payments/webhook:
 *   post:
 *     summary: Handle payment webhook
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
Router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export default Router;
