import { prisma as prismaClient } from '../config/db.js';
import OrderStatus from '../constants/enums/orderStatus.js';
import EventErrors from '../constants/messages/errors/event.js';
import ReviewErrors from '../constants/messages/errors/review.js';
import ConflictError from '../errors/ConflictError.js';
import ForbiddenError from '../errors/ForbiddenError.js';
import NotFoundError from '../errors/NotFoundError.js';

const eventReviewService = {
    async create({ userId, eventId, rating, comment  }) {
        const exist = await prismaClient.event.findFirst({
            where: { id: eventId },
            include: {     
                organizer: true,
            }
        });

        if(!exist){
            throw new NotFoundError(undefined, undefined, [EventErrors.EVENT_NOT_FOUND]);
        }

        if(exist.organizer.userId === userId){
            throw new ConflictError(undefined, undefined, [ReviewErrors.CANNOT_REVIEW_OWN_EVENT]);
        }

        const review = await prismaClient.eventReview.create({
            data: {
                userId,
                eventId,
                rating,
                comment: comment || "",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                }
            },
        });

        return review;
    },

    async update({ reviewId, userId, rating, comment }) {
        const existingReview = await prismaClient.eventReview.findUnique({
            where: { id: reviewId },
        });

        if (!existingReview) {
            throw new NotFoundError(undefined, undefined, [ReviewErrors.REVIEW_NOT_FOUND]);
        }

        if (existingReview.userId !== userId) {
            throw new ForbiddenError(undefined, undefined, [ReviewErrors.UNAUTHORIZED_REVIEW_ACTION]);
        }

        const updatedReview = await prismaClient.eventReview.update({
            where: {
                id: reviewId,
            },
            data: {
                rating: rating || undefined,
                comment: comment !== undefined ? comment : undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                }
            },
        });

        return updatedReview;
    },

    async delete({ reviewId, userId }) {
        const existingReview = await prismaClient.eventReview.findUnique({
            where: { id: reviewId },
        });

        if (!existingReview) {
            throw new NotFoundError(undefined, undefined, [ReviewErrors.REVIEW_NOT_FOUND]);
        }

        if (existingReview.userId !== userId) {
            throw new ForbiddenError(undefined, undefined, [ReviewErrors.UNAUTHORIZED_REVIEW_ACTION]);
        }

        await prismaClient.eventReview.delete({
            where: {
                id: reviewId,
            },
        });
    },

    async getByEventId({eventId,  page, limit }) {
        const pageNumber = page !== undefined ? Number(page) : undefined;
        const limitNumber = limit!== undefined ? Number(limit) : undefined;
        const skip = (pageNumber && limitNumber) ? (pageNumber - 1) * limitNumber : undefined;
        const take = limitNumber;

        const [reviews, total, aggregate] = await Promise.all([
            prismaClient.eventReview.findMany({
                where: { eventId },
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prismaClient.eventReview.count({ where: { eventId } }),
            prismaClient.eventReview.aggregate({
                where: { eventId },
                _avg: { rating: true },
            }),
        ]);

        const avgRating = aggregate._avg.rating || 0;

        return {
            reviews,
            total,
            averageRating: parseFloat(avgRating.toFixed(1)),
            page: pageNumber || 1,
            limit: limitNumber || total,
        };
    },

    async getUserEventReview({userId, eventId}) {
        const [review, event] = await Promise.all([
            prismaClient.eventReview.findUnique({
                where: {
                    userId_eventId: {
                        userId,
                        eventId
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            prismaClient.event.findUnique({
                where: { id: eventId },
                select: { organizer: { select: { userId: true } } }
            })
        ]);

        const canReview = event?.organizer.userId !== userId;

        if(review == null){
           return { review: 0, canReview };
        }

        return { ...review, canReview };
    },

};

export default eventReviewService;
