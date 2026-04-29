//@ts-check

import AdminErrors from './../constants/messages/errors/admin.js';

import ForbiddenError from './../errors/ForbiddenError.js';
import NotFoundError from './../errors/NotFoundError.js';

/**
 * @typedef {import('./../types/models/index.js').Admin} Admin
 * @typedef {Admin | null | undefined} MaybeAdmin
 */

class AdminPolicy {
    /**
     * @param {MaybeAdmin} admin
     */
    canLogin(admin) {
        if (!admin) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: AdminErrors.ADMIN_NOT_FOUND.message,
                    code: AdminErrors.ADMIN_NOT_FOUND.code,
                },
            ]);
        }

        if (admin.isApproved === false) {
            throw new ForbiddenError(undefined, undefined, [
                {
                    message: AdminErrors.ADMIN_NOT_APPROVED.message,
                    code: AdminErrors.ADMIN_NOT_APPROVED.code,
                },
            ]);
        }

        return true;
    }

    /**
     * @param {MaybeAdmin} admin
     */
    canAccessDashboard(admin) {
        if (!admin) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: AdminErrors.ADMIN_NOT_FOUND.message,
                    code: AdminErrors.ADMIN_NOT_FOUND.code,
                },
            ]);
        }

        if (admin.isApproved === false) {
            throw new ForbiddenError(undefined, undefined, [
                {
                    message: AdminErrors.ADMIN_NOT_APPROVED.message,
                    code: AdminErrors.ADMIN_NOT_APPROVED.code,
                },
            ]);
        }

        return true;
    }
}

export default new AdminPolicy();
