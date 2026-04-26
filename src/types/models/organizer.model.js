// @ts-check

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 * @typedef {import('@prisma/client').Organizer} OrganizerData
 * @typedef {import('@prisma/client').Prisma.OrganizerCreateInput} OrganizerCreate
 * @typedef {import('@prisma/client').Prisma.OrganizerUpdateInput} OrganizerUpdate
 * @typedef {import('@prisma/client').Prisma.OrganizerWhereUniqueInput} OrganizerWhereUnique
 * @typedef {import('@prisma/client').Prisma.OrganizerWhereInput} OrganizerWhere
 * @typedef {import('@prisma/client').Prisma.OrganizerSelect} OrganizerSelect
 * @typedef {import('@prisma/client').Prisma.OrganizerInclude} OrganizerInclude
 * @typedef {import('@prisma/client').Prisma.OrganizerAggregateArgs} OrganizerAggregate
 * @typedef {import('@prisma/client').Prisma.OrganizerDefaultArgs} OrganizerDefaultArgs
 */

/** @typedef {import('./../shared/common.types.js').RepositoryProjection<OrganizerSelect, OrganizerInclude, OrganizerDefaultArgs['omit']>} OrganizerProjection */
/** @typedef {import('./../shared/common.types.js').RepositoryReadOptions<OrganizerWhere, OrganizerSelect, OrganizerInclude, OrganizerDefaultArgs['omit']>} OrganizerReadOptions */
/** @typedef {OrganizerReadOptions & { 
 *  q?: string, 
 *  status?: import('@prisma/client').$Enums.OrganizerStatus, 
 *  verificationStatus?: import('@prisma/client').$Enums.OrganizerVerificationStatus 
 * }} OrganizerFilters */

/** @typedef {import('@prisma/client').Prisma.OrganizerGetPayload<{ include: { user: true, hobbyist: true, business: true, company: true } }>} OrganizerWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/Organizer.js').default>} OrganizerLogic */
/** @typedef {OrganizerWithRelations & OrganizerLogic} Organizer */
/** @typedef {Organizer} OrganizerHydrated */

/**
 * @typedef {object} OrganizerResourceData
 * @property {string | null} id
 * @property {string | null} userId
 * @property {string | null} name
 * @property {import('@prisma/client').$Enums.OrganizerType | null} type
 * @property {string | null} contactEmail
 * @property {string | null} contactPhone
 * @property {import('@prisma/client').$Enums.OrganizerStatus | null} status
 * @property {import('@prisma/client').$Enums.OrganizerVerificationStatus | null} verificationStatus
 * @property {number | null} reviewedBy
 * @property {Date | null} reviewedAt
 * @property {string | null} rejectionReason
 * @property {string | null} suspendReason
 * @property {Date | null} createdAt
 * @property {Date | null} updatedAt
 */

/** @typedef {import('./../shared/common.types.js').PaginatedResult<OrganizerResourceData>} OrganizerPaginatedResource */

/**
 * @typedef {object} AdminOrganizerPaginatedResource
 * @property {OrganizerResourceData[]} organizers
 * @property {import('./../shared/common.types.js').PaginationMeta} pagination
 */

/**
 * @typedef {import('@prisma/client').Prisma.BusinessUncheckedCreateInput} Business
 * @typedef {import('@prisma/client').Prisma.CompanyUncheckedCreateInput} Company
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
