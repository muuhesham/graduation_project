import express from "express";
import categoryController from '../controllers/categoryController.js';
import { publicLimiter } from "../middlewares/rateLimiter.js";

const Router = express.Router();

/**
 * @openapi
 * /api/v1/category:
 *   get:
 *     summary: List all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of categories
 */
Router.get('/', publicLimiter, categoryController.getAllCategories);

export default Router;


