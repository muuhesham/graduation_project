import { Queue } from 'bullmq';
import redisQueue from './../config/redis-queue.js';

const smsQueue = new Queue('smsQueue', {
    connection: redisQueue,
});

export default smsQueue;
