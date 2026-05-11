import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../config/env.js';
import { prisma as prismaClient } from '../config/db.js';
import organizerService from './organizerService.js';
import AppError from '../errors/AppError.js';
import notificationService from './notificationService.js';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

const couponService = {
    async createCoupon({ code, discount }) {
        const existingCoupon = await prismaClient.coupon.findUnique({
            where: { code },
        });

        if (existingCoupon) {
            throw new AppError('Coupon code already exists. Try a different code.');
        }

        const coupon = await stripe.coupons.create({
            percent_off: discount,
            duration: 'once',
        });

        const promoCode = await stripe.promotionCodes.create({
            coupon: coupon.id,
            code: code,
            max_redemptions: 20,
        });

        const createdCoupon = await prismaClient.coupon.create({
            data: {
                code: code,
                stripePromoId: promoCode.id,
            },
        });

        await notificationService.broadcastAnnouncement(
            'New Coupon Available!',
            `Use code "${code}" to get ${discount}% off on your next purchase!`
        );

        return createdCoupon;
    },

    async deleteCoupon({ id }) {
        const coupon = await prismaClient.coupon.findFirst({
            where: { id },
        });

        if (!coupon) {
            throw new AppError('Coupon not found');
        }

        await stripe.promotionCodes.update(coupon.stripePromoId, { active: false });
        return await prismaClient.coupon.delete({ where: { id } });
    },

    async getAllCoupons({}) {
        return await prismaClient.coupon.findMany({});
    },
};

export default couponService;
