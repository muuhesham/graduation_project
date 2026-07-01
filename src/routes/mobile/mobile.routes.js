import { Router } from 'express';
import mobileController from '../../controllers/mobile/mobileController.js';
import mobileValidations from '../../validations/mobileValidation.js';
import validate from '../../middlewares/validate.js';
import organizerAuth from '../../middlewares/organizerAuth.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

/**
 * @openapi
 * /api/v1/mobile/login:
 *   post:
 *     summary: Mobile login
 *     tags: [Mobile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authLimiter, mobileValidations.login, validate, mobileController.login);

/**
 * @openapi
 * /api/v1/mobile/scan:
 *   post:
 *     summary: Scan ticket
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticketId]
 *             properties:
 *               ticketId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket scanned successfully
 */
router.post('/scan', organizerAuth, mobileValidations.scan, validate, mobileController.scan);

export default router;
