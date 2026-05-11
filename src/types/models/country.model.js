//@ts-check

/**
 * @typedef {import('@prisma/client').Country} CountryData
 * @typedef {import('@prisma/client').Prisma.CountryCreateInput} CountryCreate
 * @typedef {import('@prisma/client').Prisma.CountryUpdateInput} CountryUpdate
 * @typedef {import('@prisma/client').Prisma.CountryWhereUniqueInput} CountryWhereUnique
 * @typedef {import('@prisma/client').Prisma.CountryWhereInput} CountryWhere
 * @typedef {import('@prisma/client').Prisma.CountrySelect} CountrySelect
 * @typedef {import('@prisma/client').Prisma.CountryInclude} CountryInclude
 * @typedef {import('@prisma/client').Prisma.CountryDefaultArgs} CountryDefaultArgs
 * @typedef {import('./../shared/common.types').RepositoryProjection<CountrySelect, CountryInclude, CountryDefaultArgs['omit']>} CountryProjection
 * @typedef {import('./../shared/common.types').RepositoryReadOptions<CountryWhere, CountrySelect, CountryInclude, CountryDefaultArgs['omit']>} CountryReadOptions
 */

/** @typedef {import('@prisma/client').Prisma.CountryGetPayload<{ include: { states: true, organizers: true } }>} CountryWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/Country').default>} CountryLogic */
/** @typedef {CountryWithRelations & CountryLogic} Country */
/** @typedef {Country} CountryHydrated */

/**
 * @typedef {object} CountryResourceData
 * @property {number} id
 * @property {string} name
 * @property {string} code
 * @property {string} phoneCode
 * @property {string | null} taxIdLocale
 * @property {string} currencyCode
 * @property {string} currencySymbol
 * @property {string} flagEmoji
 * @property {boolean} isSupported
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {};
