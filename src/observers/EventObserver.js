//@ts-check

import BaseObserver from './BaseObserver.js';

import fileService from '../services/fileService.js';
import mailService from '../services/mailService.js';
import { prisma } from '../config/db.js';
import { FRONT_URL } from '../config/env.js';

import { addEmbeddingJob, EmbeddingJobType } from '../queues/embeddingQueue.js';

/**
 * @typedef {import('./../types/models').Event} Event
 */

/**
 * @extends {BaseObserver<Event>}
 */
export default class EventObserver extends BaseObserver {
    /**
     * @param {Event} event
     * @param {any} [tx]
     */
    async created(event, tx) {
        await addEmbeddingJob(EmbeddingJobType.GENERATE_EMBEDDING, String(event.id)).catch(
            (err) => {
                console.error(`Failed to queue embedding generation for event ${event.id}:`, err);
            }
        );

        try {
            const organizer = await prisma.organizer.findUnique({
                where: { id: event.organizerId },
                include: {
                    followers: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });

            if (organizer && organizer.followers.length > 0) {
                const eventUrl = `${FRONT_URL}/events/${event.id}`;
                const emailPromises = organizer.followers.map((follower) => {
                    if (!follower.user.email) return Promise.resolve();

                    return mailService.sendQueued({
                        to: follower.user.email,
                        subject: `New Event from ${organizer.name}!`,
                        templateName: 'newEventNotificationMail',
                        variables: {
                            userName: follower.user.name || 'there',
                            organizerName: organizer.name,
                            eventTitle: event.title,
                            eventUrl,
                            plainText: `An organizer you follow, ${organizer.name}, has just published a new event: ${event.title}. Check it out here: ${eventUrl}`,
                        },
                    });
                });

                await Promise.allSettled(emailPromises);
            }
        } catch (err) {
            console.error(`Failed to notify followers for new event ${event.id}:`, err);
        }
    }

    /**
     * @param {Event} event
     * @param {any} [tx]
     */
    async updated(event, tx) {
        await addEmbeddingJob(EmbeddingJobType.UPDATE_EMBEDDING, String(event.id)).catch((err) => {
            console.error(`Failed to queue embedding update for event ${event.id}:`, err);
        });
    }

    /**
     * @param {Event} event
     * @param {any} [tx]
     */
    async deleting(event, tx) {
        if (event.bannerPath) {
            await fileService.delete(event.bannerPath).catch((err) => {
                console.error(`Failed to delete banner file for event ${event.id}:`, err);
            });
        }
    }

    /**
     * @param {Event} event
     * @param {any} [tx]
     */
    async deleted(event, tx) {
        await addEmbeddingJob(EmbeddingJobType.DELETE_EMBEDDING, String(event.id)).catch((err) => {
            console.error(`Failed to queue embedding deletion for event ${event.id}:`, err);
        });
    }
}
