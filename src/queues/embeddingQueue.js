//@ts-check

import { Queue } from 'bullmq';
import redisQueue from '../config/redis-queue.js';

/** Embedding job types */
export const EmbeddingJobType = {
    GENERATE_EMBEDDING: 'generate_embedding',
    UPDATE_EMBEDDING: 'update_embedding',
    DELETE_EMBEDDING: 'delete_embedding',
};

const embeddingQueue = new Queue('embeddingQueue', {
    // @ts-expect-error BullMQ/ioredis duplicate type mismatch in installed deps
    connection: redisQueue,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            count: 100,
            age: 24 * 3600, // 24 hours
        },
        removeOnFail: {
            count: 500,
        },
    },
});

/**
 * Add embedding job to queue
 *
 * @param {string} type - Job type
 * @param {string} eventId - Event ID
 * @param {{ priority?: number } & Record<string, any>} [options] - Job options
 * @returns {Promise<Object>} Job
 */
export async function addEmbeddingJob(type, eventId, options = {}) {
    return embeddingQueue.add(
        type,
        { type, eventId, ...options },
        {
            priority: options.priority || 2,
            ...options,
        }
    );
}

export default embeddingQueue;
