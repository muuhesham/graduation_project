import express from "express";
import couponController from "../controllers/couponController.js";
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import { publicLimiter } from "../middlewares/rateLimiter.js";
import couponValidation from "../validations/couponValidation.js";
import validate from "../middlewares/validate.js";
const Router = express.Router();

Router.get('/', auth, authorize.isAdmin, publicLimiter,  couponController.getAllCoupons);
Router.post('/', auth, authorize.isAdmin, publicLimiter, couponValidation.createCoupon, validate, couponController.createCoupon);
Router.delete('/:id', auth, authorize.isAdmin, publicLimiter, couponValidation.deleteCoupon, validate, couponController.deleteCoupon);

export default Router;