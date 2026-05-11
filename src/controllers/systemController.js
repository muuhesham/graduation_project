//@ts-check

import asyncWrapper from '../middlewares/asyncWrapper.js';
import { sendSuccess, sendError } from '../utils/response.js';
import systemService from '../services/systemService.js';

const systemController = {
    /**
     * Production-ready health check.
     * Accessible by admins only (via route configuration).
     */
    health: asyncWrapper(async (req, res) => {
        const healthStatus = await systemService.checkHealth();

        if (healthStatus.status === 'UP') {
            return sendSuccess(res, healthStatus);
        }

        return sendError(res, 'System is degraded or down', 'SYSTEM_UNHEALTHY', healthStatus, 503);
    }),
};

export default systemController;
