//@ts-check

import UserRoles from './../constants/enums/userRoles.js';

import UserErrors from './../constants/messages/errors/user.js';

import NotFoundError from './../errors/NotFoundError.js';
import ForbiddenError from '../errors/ForbiddenError.js';
import ConflictError from './../errors/ConflictError.js';

/** @typedef {import('@prisma/client').User} User */

class UserPolicy {
    /**
     * @param {User} user
     * @throws {AppError}
     */
    canUpgrade(user) {
        if (!user) {
            throw new NotFoundError(
                UserErrors.USER_NOT_FOUND.message,
                UserErrors.USER_NOT_FOUND.code
            );
        }

        if (!user.isVerified) {
            throw new ForbiddenError(
                UserErrors.EMAIL_NOT_VERIFIED.message,
                UserErrors.EMAIL_NOT_VERIFIED.code
            );
        }

        if (user.role == UserRoles.ORGANIZER) {
            throw new ConflictError(
                UserErrors.ALREADY_ORGANIZER.message,
                UserErrors.ALREADY_ORGANIZER.code
            );
        }
    }
}

export default new UserPolicy();
export { UserPolicy };
