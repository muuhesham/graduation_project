import { getIO } from '../config/socketInstance.js';

const notificationService = {
    async sendNotification(
        recipientId,
        recipientType,
        type,
        title,
        message,
        relatedEventId = null,
        relatedOrderId = null
    ) {
        try {
            const io = getIO();
            const roomName = `${recipientType.toLowerCase()}-${recipientId}`;

            const notificationData = {
                id: `${Date.now()}-${Math.random().toString(36)}`,
                type,
                title,
                message,
                relatedEventId,
                relatedOrderId,
                createdAt: new Date().toISOString(),
            };

            io.to(roomName).emit('notification:new', notificationData);

            console.log(`Notification sent to ${roomName}: ${type}`);
            return notificationData;
        } catch (error) {
            console.error('Failed to send notification:', error);
            return null;
        }
    },

    async notifyPurchaseSuccess(userId, eventId, orderId, eventTitle, ticketCount) {
        return notificationService.sendNotification(
            userId,
            'USER',
            'PURCHASE_SUCCESS',
            'Purchase completed successfully! All details have been sent to your email.',
            `You have successfully booked ${ticketCount} ticket(s) for "${eventTitle}". Enjoy the event!`,
            eventId,
            orderId
        );
    },

    async notifyPurchaseFailed(userId, eventTitle, orderId) {
        return notificationService.sendNotification(
            userId,
            'USER',
            'PURCHASE_FAILED',
            'Purchase failed!',
            `The purchase for "${eventTitle}" failed. Please try again.`,
            null,
            orderId
        );
    },

    async notifyRefundProcessed(userId, eventTitle, refundAmount, orderId) {
        return notificationService.sendNotification(
            userId,
            'USER',
            'REFUND_PROCESSED',
            'The event was cancelled and your money was refunded!',
            `Sorry! The event "${eventTitle}" was cancelled. A refund of $${refundAmount} has been processed to your account.`,
            null,
            orderId
        );
    },

    async notifyEventCreated(organizerId, eventId, eventTitle, categoryName) {
        return notificationService.sendNotification(
            organizerId,
            'ORGANIZER',
            'EVENT_CREATED',
            'Event created!',
            `Your event "${eventTitle}" has been created successfully under category "${categoryName}".`,
            eventId
        );
    },

    async notifyEventUpdated(eventId, eventTitle, interestedUserIds = []) {
        try {
            const notifications = await Promise.all(
                interestedUserIds.map((userId) =>
                    notificationService.sendNotification(
                        userId,
                        'USER',
                        'EVENT_UPDATED',
                        'Event updated!',
                        `The details of the event "${eventTitle}" you are interested in have been updated.`,
                        eventId
                    )
                )
            );
            return notifications;
        } catch (error) {
            console.error('Failed to notify event update:', error);
            return null;
        }
    },

    async notifyNewTicketPurchase(
        organizerId,
        eventId,
        eventTitle,
        buyerName,
        ticketCount,
        orderId
    ) {
        return notificationService.sendNotification(
            organizerId,
            'ORGANIZER',
            'NEW_TICKET_PURCHASE',
            'New ticket purchase!',
            `${buyerName} has booked ${ticketCount} ticket(s) for your event "${eventTitle}".`,
            eventId,
            orderId
        );
    },

    async notifyNewEventToFollowers(followersIds, organizerName, eventId, eventTitle) {
        try {
            const notifications = await Promise.all(
                followersIds.map((userId) =>
                    notificationService.sendNotification(
                        userId,
                        'USER',
                        'NEW_EVENT_FROM_FOLLOWED',
                        'New Event from Organizer!',
                        `An organizer you follow, ${organizerName}, just created a new event: "${eventTitle}".`,
                        eventId
                    )
                )
            );
            return notifications;
        } catch (error) {
            console.error('Failed to notify followers about new event:', error);
            return null;
        }
    },

    async broadcastAnnouncement(title, message) {
        try {
            const io = getIO();
            const announcementData = {
                id: `broadcast-${Date.now()}`,
                type: 'SYSTEM_ANNOUNCEMENT',
                title,
                message,
                createdAt: new Date().toISOString(),
            };

            io.emit('notification:new', announcementData);

            console.log(`Announcement sent to all clients: ${title}`);
            return announcementData;
        } catch (error) {
            console.error('Failed to broadcast announcement:', error);
            return null;
        }
    },
};

export default notificationService;
