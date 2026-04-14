import { Worker } from 'bullmq';
import redisQueue from './../config/redis-queue.js';
import smsService from './../services/sms/smsService.js';

const smsWorker = new Worker(
    'smsQueue',
    async (job) => {
        const { to, body } = job.data;

        try {
            await smsService.sendRawMessage({ to, body });
            return { success: true, to };
        } catch (error) {
            console.error('❌ Failed to send SMS:', error.message);
            throw error;
        }
    },
    { connection: redisQueue }
);

smsWorker.on('completed', (job) => {
    console.log(`✅ SMS job ${job.id} completed successfully`);
});

smsWorker.on('failed', (job, err) => {
    console.error(`❌ SMS job ${job?.id} failed: ${err.message}`);
});

export default smsWorker;
