//@ts-check

import OrganizerTypes from './../constants/enums/organizerTypes.js';

import OrganizerErrors from './../constants/messages/errors/organizer.js';

import { Business, Company, Hobbyist } from './../models/index.js';

import NotFoundError from './../errors/NotFoundError.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 */

export default class OrganizerFactory {
    /**
     * @param {string} type
     * @returns {Business | Company | Hobbyist}
     */
    static createInstance(type) {
        switch (type) {
            case OrganizerTypes.HOBBYIST:
                return new Hobbyist();
            case OrganizerTypes.BUSINESS:
                return new Business();
            case OrganizerTypes.COMPANY:
                return new Company();
            default:
                throw new NotFoundError(
                    OrganizerErrors.INVALID_ORGANIZER_TYPE.message,
                    OrganizerErrors.INVALID_ORGANIZER_TYPE.code
                );
        }
    }
}
