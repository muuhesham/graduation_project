//@ts-check

import { Worker } from 'bullmq';
import redisQueue from '../config/redis-queue.js';
import eventEmbeddingService from '../services/eventEmbeddingService.js';
import { EmbeddingJobType } from '../queues/embeddingQueue.js';
import InternalServerError from '../errors/InternalServerError.js';

/**
 * @typedef {import('bullmq').Job} Job
 */

const embeddingWorker = new Worker(
    'embeddingQueue',
    async (job) => {
        const { type, eventId } = job.data;

        switch (type) {
            case EmbeddingJobType.GENERATE_EMBEDDING:
            case EmbeddingJobType.UPDATE_EMBEDDING:
                return await eventEmbeddingService.sync(eventId);

            case EmbeddingJobType.DELETE_EMBEDDING:
                return await eventEmbeddingService.remove(eventId);

            default:
                throw new InternalServerError(undefined, undefined, [
                    {
                        message: `Unknown embedding job type: ${type}`,
                        code: 'UNKNOWN_JOB_TYPE',
                    },
                ]);
        }
    },
    {
        connection: redisQueue,
        concurrency: 5,
    }
);

embeddingWorker.on('completed', (job) => {
    console.log(`[Embedding Worker] Job ${job.id} completed for event ${job.data?.eventId}`);
});

embeddingWorker.on('failed', (job, err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Embedding Worker] Job ${job?.id} failed for event ${job?.data?.eventId}:`, message);
});

embeddingWorker.on('error', (err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Embedding Worker] General error:', message);
});

embeddingWorker.on('active', (job) => {
    console.log(`[Embedding Worker] Job ${job.id} started for event ${job.data?.eventId}`);
});

export default embeddingWorker;
