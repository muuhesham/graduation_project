import Stripe from 'stripe';
import {
    STRIPE_SECRET_KEY,
    SUCCESS_URL,
    CANCEL_URL,
    APP_CURRENCY,
    STRIPE_WEBHOOK_SECRET,
} from '../config/env.js';
import { prisma as prismaClient } from '../config/db.js';
import { redis } from '../config/redis.js';
import AppError from '../errors/AppError.js';
import ticketTypeService from './ticketTypeService.js';
import orderService from './orderService.js';
import notificationService from './notificationService.js';
import mailService from './mailService.js';
import fileService from './fileService.js';
import OrderStatus from '../constants/enums/orderStatus.js';
import { getIO } from '../config/socketInstance.js';

const paymentService = {
    stripe: new Stripe(STRIPE_SECRET_KEY),

    async createCheckoutSession(
        paymentMethods = ['card'],
        mode = 'payment',
        lineItems,
        customerEmail,
        metadata = {}
    ) {
        return await paymentService.stripe.checkout.sessions.create({
            payment_method_types: paymentMethods,
            mode: mode,
            line_items: lineItems,
            success_url: SUCCESS_URL,
            cancel_url: CANCEL_URL,
            customer_email: customerEmail,
            metadata,
            payment_intent_data: {
                metadata
            },
            allow_promotion_codes: true,
        });
    },
    async retrieveSession(sessionId) {
        return paymentService.stripe.checkout.sessions.retrieve(sessionId);
    },

    async retrievePaymentIntent(paymentIntentId) {
        return paymentService.stripe.paymentIntents.retrieve(paymentIntentId);
    },

    async createPaymentIntent(amount, currency, metadata = {}) {
        return paymentService.stripe.paymentIntents.create({
            amount,
            currency,
            metadata,
        });
    },

    /**
     * Executes a batch of transfers to various accounts.
     * Use this for processing organizer payouts after an event or settlement period.
     *
     * @param {Array<{ amount: number, accountId: string, referenceId: string|number }>} transfers
     */
    async executePayoutBatch(transfers) {
        const results = await Promise.allSettled(
            transfers.map((item) =>
                this.transferToAccount(
                    item.amount,
                    item.accountId,
                    `Payout Ref: ${item.referenceId}`
                )
            )
        );

        const summary = {
            success: results.filter((r) => r.status === 'fulfilled').length,
            failed: results.filter((r) => r.status === 'rejected').length,
        };

        console.log(
            `[Finance] Batch payout completed. Success: ${summary.success}, Failed: ${summary.failed}`
        );
        return summary;
    },

    /**
     * Sends money to a connected Stripe account.
     * @param {number} amount - Amount in cents
     * @param {string} destinationAccountId - The target Stripe Account ID
     * @param {string} [description]
     */
    async transferToAccount(amount, destinationAccountId, description = 'Platform transfer') {
        try {
            return await paymentService.stripe.transfers.create({
                amount: Math.round(amount * 100), // Stripe expects cents
                currency: APP_CURRENCY.toLowerCase(),
                destination: destinationAccountId,
                description,
            });
        } catch (err) {
            console.error('❌ Stripe Transfer Failed:', err);
            throw new AppError(`Transfer failed: ${err.message}`, 500, 'TRANSFER_FAILED');
        }
    },

    async handleWebhookEvent(signature, rawBody) {
        let event;
        try {
            event = paymentService.stripe.webhooks.constructEvent(
                rawBody,
                signature,
                STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            throw new AppError(`Signature verification failed: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.completed':
                await paymentService.handleCheckoutCompleted(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await paymentService.handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    },

    async handleCheckoutCompleted(session) {
        const orderId = session.metadata.orderId;
        const userId = session.metadata.userId;
        const finalAmountPaid = session.amount_total / 100;
        const seatMetaData = JSON.parse(session.metadata.seatMetaData || '[]');
        const reservedSeatKeys = seatMetaData
            .filter(
                (item) => item.eventId != null && item.rowIndex != null && item.seatIndex != null
            )
            .map(
                (item) =>
                    `reservation:event:${item.eventId}:seat:${item.rowIndex}-${item.seatIndex}`
            );

        let eventInfo = null;
        let totalTickets = 0;

        await prismaClient.$transaction(
            async (tx) => {
                const order = await tx.order.findUnique({
                    where: { id: orderId },
                    include: {
                        orderItems: true,
                        user: true,
                    },
                });

                if (!order || order.status === OrderStatus.COMPLETED) return;

                if (order.orderItems.length > 0) {
                    eventInfo = await tx.ticketType.findUnique({
                        where: { id: order.orderItems[0].ticketTypeId },
                        include: { event: { include: { organizer: true } } },
                    });
                    totalTickets = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
                }

                await tx.order.update({
                    where: { id: orderId },
                    data: {
                        totalPrice: finalAmountPaid,
                    },
                });

                if (seatMetaData && seatMetaData.length > 0 && seatMetaData[0]?.seatIndex != null) {
                    await tx.eventSeat.updateMany({
                        where: {
                            OR: seatMetaData.map((item) => ({
                                rowIndex: item.rowIndex,
                                seatIndex: item.seatIndex,
                                eventId: item.eventId,
                            })),
                        },
                        data: {
                            isSold: true,
                        },
                    });
                }
                await ticketTypeService.issueTicketsForOrder(
                    orderId,
                    userId,
                    order.orderItems,
                    seatMetaData,
                    tx
                );
                await orderService.updateOrderStatus(orderId, OrderStatus.COMPLETED, tx);
            },
            {
                timeout: 15000,
            }
        );

        if (eventInfo) {
            const buyer = await prismaClient.user.findFirst({ where: { id: userId } });

            const order = await prismaClient.order.findUnique({
                where: { id: orderId },
                include: {
                    orderItems: {
                        include: {
                            ticketType: true,
                        },
                    },
                },
            });

            const eventDetails = await prismaClient.event.findUnique({
                where: { id: eventInfo.event.id },
                include: {
                    venue: true,
                    eventSessions: {
                        orderBy: { startDate: 'asc' },
                        take: 1,
                    },
                },
            });

            const ticketDetails = order.orderItems.map((item) => ({
                type: item.ticketType.name,
                quantity: item.quantity,
                price: (item.price / 100).toFixed(2),
            }));

            const eventDateTime = eventDetails.eventSessions?.[0];
            const eventDate = eventDateTime
                ? new Date(eventDateTime.startDate).toLocaleDateString()
                : 'TBD';
            const eventTime = eventDateTime
                ? new Date(eventDateTime.startDate).toLocaleTimeString()
                : 'TBD';

            const allTickets = await prismaClient.ticket.findMany({
                where: { orderId },
                include: {
                    qrCode: {
                        select: { codePath: true },
                    },
                },
            });

            const qrCodes = allTickets
                .map((ticket) => {
                    if (ticket.qrCode?.codePath) {
                        return fileService.getAbsUrl(ticket.qrCode.codePath);
                    }
                    return null;
                })
                .filter((url) => url !== null);

            await mailService.sendPurchaseConfirmationJob(
                buyer,
                {
                    title: eventDetails.title,
                    description: eventDetails.description,
                    date: eventDate,
                    time: eventTime,
                    venueName: eventDetails.venue.name,
                    venueAddress: eventDetails.venue.address,
                },
                ticketDetails,
                finalAmountPaid.toFixed(2),
                orderId,
                qrCodes
            );

            await Promise.all([
                notificationService.notifyPurchaseSuccess(
                    userId,
                    eventInfo.event.id,
                    orderId,
                    eventInfo.event.title,
                    totalTickets
                ),
                notificationService.notifyNewTicketPurchase(
                    eventInfo.event.organizerId,
                    eventInfo.event.id,
                    eventInfo.event.title,
                    buyer?.name || 'someone',
                    totalTickets,
                    orderId
                ),
            ]);
        }

        if (reservedSeatKeys.length > 0) {
            await redis.del(...reservedSeatKeys);
        }
        const io = getIO();
        for (const item of seatMetaData) {
            io.to(`event-${item.eventId}`).emit('seat:update', {
                row: item.rowIndex,
                number: item.seatIndex,
                status: 'sold',
            });
        }
    },

    async handlePaymentFailed(session) {
        const orderId = session.metadata.orderId;
        const userId = session.metadata.userId;

        const order = await prismaClient.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: {
                        ticketType: {
                            include: { event: true },
                        },
                    },
                },
            },
        });

        await orderService.updateOrderStatus(orderId, OrderStatus.CANCELED);

        if (order && order.orderItems.length > 0) {
            const eventTitle = order.orderItems[0].ticketType.event.title;
            await notificationService.notifyPurchaseFailed(userId, eventTitle, orderId);
        }
    },
};

export default paymentService;
