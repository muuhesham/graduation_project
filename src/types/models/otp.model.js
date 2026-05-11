//@ts-check

/**
 * @typedef {import('@prisma/client').Otp} OtpData
 * @typedef {import('@prisma/client').Prisma.OtpUncheckedCreateInput} OtpCreate
 * @typedef {import('@prisma/client').Prisma.OtpUncheckedUpdateInput} OtpUpdate
 * @typedef {import('@prisma/client').Prisma.OtpWhereUniqueInput} OtpWhereUnique
 * @typedef {import('@prisma/client').Prisma.OtpWhereInput} OtpWhere
 * @typedef {import('@prisma/client').Prisma.OtpSelect} OtpSelect
 * @typedef {import('@prisma/client').Prisma.OtpInclude} OtpInclude
 * @typedef {import('@prisma/client').Prisma.OtpDefaultArgs} OtpDefaultArgs
 * @typedef {import('./../shared/common.types').RepositoryProjection<OtpSelect, OtpInclude, OtpDefaultArgs['omit']>} OtpProjection
 * @typedef {import('./../shared/common.types').RepositoryReadOptions<OtpWhere, OtpSelect, OtpInclude, OtpDefaultArgs['omit']>} OtpReadOptions
 * @typedef {import('./../shared/common.types').RepositoryFindUniqueOptions<OtpWhereUnique, OtpSelect, OtpInclude, OtpDefaultArgs['omit']>} OtpFindUniqueOptions
 */

/** @typedef {InstanceType<typeof import('./../../models/Otp').default>} OtpLogic */
/** @typedef {OtpData & OtpLogic} Otp */
/** @typedef {Otp} OtpHydrated */

export {};
