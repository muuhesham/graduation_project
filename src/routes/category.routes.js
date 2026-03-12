import express from "express";
import categoryController from '../controllers/categoryController.js';
import { publicLimiter } from "../middlewares/rateLimiter.js";

const Router = express.Router();


Router.get('/', publicLimiter, categoryController.getAllCategories);

export default Router;


