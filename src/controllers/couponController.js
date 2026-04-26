import asyncHandler from '../middlewares/asyncWrapper.js';
import couponService from '../services/couponService.js';
import { sendSuccess } from '../utils/response.js';

const couponController = {
    getAllCoupons: asyncHandler(async (req, res) => {
        const coupons = await couponService.getAllCoupons({});

        return sendSuccess(res, { coupons }, 200);
    }),

    createCoupon: asyncHandler(async (req, res) => {
        const { code, discount } = req.body;
        const coupon = await couponService.createCoupon({code, discount});

        return sendSuccess(res, { coupon }, 201);
    }),

    deleteCoupon: asyncHandler(async (req, res) => {
        const { id } = req.params;

        await couponService.deleteCoupon({id});

        return sendSuccess(res, null, 204);
    }),
};

export default couponController;
