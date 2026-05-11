//@ts-check

import UserRoles from './../constants/enums/userRoles.js';

import UserErrors from './../constants/messages/errors/user.js';
import OrganizerErrors from './../constants/messages/errors/organizer.js';

import NotFoundError from './../errors/NotFoundError.js';
import ForbiddenError from '../errors/ForbiddenError.js';
import ConflictError from './../errors/ConflictError.js';

/**
 * @typedef {import('./../types/models').User} User
 * @typedef {import('./../types/models').Organizer} Organizer
 */

class UserPolicy {
    /**
     * @param {User & { organizer?: Organizer }} user
     * @throws {AppError}
     */
    canUpgrade(user) {
        if (!user) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: UserErrors.USER_NOT_FOUND.message,
                    code: UserErrors.USER_NOT_FOUND.code,
                },
            ]);
        }

        if (!user.isVerified) {
            throw new ForbiddenError(undefined, undefined, [
                {
                    message: UserErrors.EMAIL_NOT_VERIFIED.message,
                    code: UserErrors.EMAIL_NOT_VERIFIED.code,
                },
            ]);
        }

        if (user.role == UserRoles.ORGANIZER || user.Organizer) {
            throw new ConflictError(undefined, undefined, [
                {
                    message: OrganizerErrors.ORGANIZER_ALREADY_EXISTS.message,
                    code: OrganizerErrors.ORGANIZER_ALREADY_EXISTS.code,
                },
            ]);
        }
    }
}

export default new UserPolicy();
export { UserPolicy };
