import { prisma as prismaClient } from '../config/db.js';
import AppError from '../errors/AppError.js';

const eventReviewService = {
    async create({ userId, eventId, rating, comment  }) {
        const exist = await prismaClient.event.findFirst({
            where: { id: eventId },
            include: {     
                organizer: true,
            }
        });

        if(!exist){
            throw new AppError(`Event not found`, 404);
        }

        if(exist.organizer.userId === userId){
            throw new AppError(`You can not review your own event`, 400);
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
            throw new AppError('Review not found', 404);
        }

        if (existingReview.userId !== userId) {
            throw new AppError('You can only update your own reviews', 401);
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
            throw new AppError('Review not found', 400);
        }

        if (existingReview.userId !== userId) {
            throw new AppError('You can only delete your own reviews', 401);
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
        const review = await prismaClient.eventReview.findUnique({
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
        });

        if(review == null){
           return { review: 0 };
        }

        return review;
    },

};

export default eventReviewService;
