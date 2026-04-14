// @ts-check

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 *
 * @typedef {import('@prisma/client').Prisma.OrganizerUncheckedCreateInput} Organizer
 *
 * @typedef {import('@prisma/client').Prisma.BusinessUncheckedCreateInput} Business
 *
 * @typedef {import('@prisma/client').Prisma.CompanyUncheckedCreateInput} Company
 *
 * @typedef {import('@prisma/client').Prisma.HobbyistUncheckedCreateInput} Hobbyist
 */

/** @typedef {Company | Business | Hobbyist} OrganizerSubtype */

/** @interface */
export class IOrganizer {
    /**
     * @param {string} organizerId
     * @param {object} data
     * @param {PrismaClient | TransactionClient} tx
     * @returns {Promise<any>}
     */
    async create(organizerId, data, tx) {
        throw new Error('Method not implemented');
    }
}
export {};
