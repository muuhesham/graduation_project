//@ts-check

import { redis } from '../config/redis.js';
import mailQueue from '../queues/mailQueue.js';
import { BASE_PATH, OLLAMA_BASE_URL } from '../config/env.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { userRepository } from '../repositories/index.js';

/**
 * @typedef {object} ServiceStatus
 * @property {'UP' | 'DOWN' | 'DEGRADED'} status
 * @property {string} timestamp
 * @property {object} details
 * @property {string} [details.database]
 * @property {string} [details.redis]
 * @property {string} [details.storage]
 * @property {string} [details.ai]
 * @property {number} [details.pendingMails]
 */

class SystemService {
    /**
     * Comprehensive health check for all core services.
     * @returns {Promise<ServiceStatus>}
     */
    async checkHealth() {
        const [db, redis, storage, ai, mail] = await Promise.allSettled([
            userRepository.countAllUsers(),
            redisClient.ping(),
            fs.access(path.join(BASE_PATH, 'uploads'), fs.constants.W_OK),
            OLLAMA_BASE_URL ? fetch(OLLAMA_BASE_URL) : Promise.resolve(null),
            mailQueue.getWaitingCount(),
        ]);

        const details = {
            database: db.status === 'fulfilled' ? 'UP' : 'DOWN',
            redis: redis.status === 'fulfilled' && redis.value === 'PONG' ? 'UP' : 'DOWN',
            storage: storage.status === 'fulfilled' ? 'UP' : 'DOWN',
            ai: ai.status === 'fulfilled' && ai.value?.ok ? 'UP' : ai.status === 'rejected' ? 'DOWN' : 'UNKNOWN',
            pendingMails: mail.status === 'fulfilled' ? mail.value : 0,
        };

        const overallStatus = 
            (details.database === 'DOWN' || details.redis === 'DOWN') ? 'DOWN' :
            (details.storage === 'DOWN' || details.ai === 'DOWN') ? 'DEGRADED' : 'UP';

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            details,
        };
    }
}

export default new SystemService();
export { SystemService };
