import express from "express";
import auth from '../middlewares/auth.js';
import ticketController from "../controllers/ticketController.js";
import ticketValidation from "../validations/ticketValidation.js";
import validate from "../middlewares/validate.js";

const Router = express.Router();

Router.get('/:id', auth, ticketValidation.getSingleTicket, validate, ticketController.getSingleTicket); 

export default Router;