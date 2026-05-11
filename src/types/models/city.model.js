//@ts-check

/**
 * @typedef {import('@prisma/client').City} CityData
 * @typedef {import('@prisma/client').Prisma.CityCreateInput} CityCreate
 * @typedef {import('@prisma/client').Prisma.CityUpdateInput} CityUpdate
 * @typedef {import('@prisma/client').Prisma.CityWhereUniqueInput} CityWhereUnique
 * @typedef {import('@prisma/client').Prisma.CityWhereInput} CityWhere
 * @typedef {import('@prisma/client').Prisma.CitySelect} CitySelect
 * @typedef {import('@prisma/client').Prisma.CityInclude} CityInclude
 * @typedef {import('@prisma/client').Prisma.CityDefaultArgs} CityDefaultArgs
 * @typedef {import('./../shared/common.types').RepositoryProjection<CitySelect, CityInclude, CityDefaultArgs['omit']>} CityProjection
 * @typedef {import('./../shared/common.types').RepositoryReadOptions<CityWhere, CitySelect, CityInclude, CityDefaultArgs['omit']>} CityReadOptions
 */

/** @typedef {import('@prisma/client').Prisma.CityGetPayload<{ include: {state: true}}>} CityWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/City').default>} CityLogic */
/** @typedef {CityWithRelations & CityLogic} City */
/** @typedef {City} CityHydrated */

/**
 * @typedef {object} CityResourceData
 *
 */

/** @typedef {import('./../shared/common.types').PaginatedResult<CityResourceData>} CityPaginatedResource */

export {};
