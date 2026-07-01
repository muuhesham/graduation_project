import express from "express";
import auth from "../middlewares/auth.js";
import ticketController from "../controllers/ticketController.js";
import ticketValidation from "../validations/ticketValidation.js";
import validate from "../middlewares/validate.js";

const Router = express.Router();

/**
 * @openapi
 * /api/v1/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket details
 */
Router.get('/:id', auth, ticketValidation.getSingleTicket, validate, ticketController.getSingleTicket);

export default Router;