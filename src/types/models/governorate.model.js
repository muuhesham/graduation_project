//@ts-check

/**
 * @typedef {import('@prisma/client').Governorate} GovernorateData
 * @typedef {import('@prisma/client').Prisma.GovernorateUncheckedCreateInput} GovernorateCreate
 * @typedef {import('@prisma/client').Prisma.GovernorateUncheckedUpdateInput} GovernorateUpdate
 * @typedef {import('@prisma/client').Prisma.GovernorateWhereUniqueInput} GovernorateWhereUnique
 * @typedef {import('@prisma/client').Prisma.GovernorateWhereInput} GovernorateWhere
 * @typedef {import('@prisma/client').Prisma.GovernorateSelect} GovernorateSelect
 * @typedef {import('@prisma/client').Prisma.GovernorateInclude} GovernorateInclude
 * @typedef {import('@prisma/client').Prisma.GovernorateDefaultArgs} GovernorateDefaultArgs
 * @typedef {import('./../shared/common.types').RepositoryProjection<GovernorateSelect, GovernorateInclude, GovernorateDefaultArgs['omit']>} GovernorateProjection
 * @typedef {import('./../shared/common.types').RepositoryReadOptions<GovernorateWhere, GovernorateSelect, GovernorateInclude, GovernorateDefaultArgs['omit']>} GovernorateReadOptions
 * @typedef {import('./../shared/common.types').RepositoryFindUniqueOptions<GovernorateWhereUnique, GovernorateSelect, GovernorateInclude, GovernorateDefaultArgs['omit']>} GovernorateFindUniqueOptions
 */

/** @typedef {import('@prisma/client').Prisma.GovernorateGetPayload<{ include: { venues: true, users: true } }>} GovernorateWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/Governorate').default>} GovernorateModel */
/** @typedef {GovernorateWithRelations & GovernorateModel} Governorate */
/** @typedef {Governorate} GovernorateHydrated */

/**
 * @typedef {object} GovernorateResourceData
 * @property {number | null} id
 * @property {import('@prisma/client').$Enums.GovernorateName | null} name
 * @property {number | null} latitude
 * @property {number | null} longitude
 * @property {number[] | null} otherGovsIdsSorted
 */

/** @typedef {import('./../shared/common.types').PaginatedResult<GovernorateResourceData>} GovernoratePaginatedResource */

export {};
