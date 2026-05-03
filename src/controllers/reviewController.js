import asyncHandler from '../middlewares/asyncWrapper.js';
import reviewService from '../services/reviewService.js';
import { sendSuccess, sendFail } from '../utils/response.js';

const reviewController = {
    create: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { eventId } = req.params;
        const { rating, comment } = req.body;

        const review = await reviewService.create({ userId, eventId, rating, comment });
        return sendSuccess(res, { review }, 201);
    }),

    update: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const reviewId  = req.params.id;
        const { rating, comment } = req.body;
        console.log(reviewId)

        const review = await reviewService.update({ reviewId, userId, rating, comment });
        return sendSuccess(res, { review }, 200);
    }),

    delete: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const reviewId  = req.params.id;

        await reviewService.delete({ reviewId, userId });
        return sendSuccess(res, {}, 204);
    }),

    getByEventId: asyncHandler(async (req, res) => {
        const { eventId } = req.params;
        const { page, limit } = req.query;

        const result = await reviewService.getByEventId({eventId, page, limit});

        return sendSuccess(res, result, 200);
    }),

    getUserEventReview: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { eventId } = req.params;

        const review = await reviewService.getUserEventReview({userId, eventId});
        return sendSuccess(res, review, 200);
    }),

};

export default reviewController;
