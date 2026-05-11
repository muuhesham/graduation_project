//@ts-check

/**
 * @typedef {import('@prisma/client').Venue} VenueData
 * @typedef {import('@prisma/client').Prisma.VenueUncheckedCreateInput} VenueCreate
 * @typedef {import('@prisma/client').Prisma.VenueUncheckedUpdateInput} VenueUpdate
 * @typedef {import('@prisma/client').Prisma.VenueWhereUniqueInput} VenueWhereUnique
 * @typedef {import('@prisma/client').Prisma.VenueWhereInput} VenueWhere
 * @typedef {import('@prisma/client').Prisma.VenueSelect} VenueSelect
 * @typedef {import('@prisma/client').Prisma.VenueInclude} VenueInclude
 * @typedef {import('@prisma/client').Prisma.VenueDefaultArgs} VenueDefaultArgs
 * @typedef {import('./../shared/common.types').RepositoryProjection<VenueSelect, VenueInclude, VenueDefaultArgs['omit']>} VenueProjection
 * @typedef {import('./../shared/common.types').RepositoryReadOptions<VenueWhere, VenueSelect, VenueInclude, VenueDefaultArgs['omit']>} VenueReadOptions
 * @typedef {import('./../shared/common.types').RepositoryFindUniqueOptions<VenueWhereUnique, VenueSelect, VenueInclude, VenueDefaultArgs['omit']>} VenueFindUniqueOptions
 */

/** @typedef {import('@prisma/client').Prisma.VenueGetPayload<{ include: { governorate: true, events: true } }>} VenueWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/Venue').default>} VenueLogic */
/** @typedef {VenueWithRelations & VenueLogic} Venue */
/** @typedef {Venue} VenueHydrated */

/**
 * @typedef {object} VenueResourceData
 * @property {number | null} id
 * @property {string | null} name
 * @property {string | null} address
 * @property {string | null} city
 * @property {string | null} state
 * @property {string | null} country
 * @property {string | null} zipCode
 * @property {number | null} latitude
 * @property {number | null} longitude
 */

/** @typedef {import('./../shared/common.types').PaginatedResult<VenueResourceData>} VenuePaginatedResource */

export {};
