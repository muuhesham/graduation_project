//@ts-check

/**
 * @typedef {import('@prisma/client').Payout} PayoutData
 * @typedef {import('@prisma/client').Prisma.PayoutCreateInput} PayoutCreate
 * @typedef {import('@prisma/client').Prisma.PayoutUpdateInput} PayoutUpdate
 * @typedef {import('@prisma/client').Prisma.PayoutWhereUniqueInput} PayoutWhereUnique
 * @typedef {import('@prisma/client').Prisma.PayoutWhereInput} PayoutWhere
 * @typedef {import('@prisma/client').Prisma.PayoutSelect} PayoutSelect
 * @typedef {import('@prisma/client').Prisma.PayoutInclude} PayoutInclude
 * @typedef {import('@prisma/client').Prisma.PayoutDefaultArgs} PayoutDefaultArgs
 * @typedef {import('./../shared/common.types').RepositoryProjection<PayoutSelect, PayoutInclude, PayoutDefaultArgs['omit']>} PayoutProjection
 */

/** @typedef {import('@prisma/client').Prisma.PayoutGetPayload<{ include: { items: true, orders: true, admin: true } }>} PayoutWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/Payout').default>} PayoutLogic */
/** @typedef {PayoutWithRelations & PayoutLogic} Payout */

/**
 * @typedef {import('@prisma/client').PayoutItem} PayoutItemData
 * @typedef {import('@prisma/client').Prisma.PayoutItemCreateInput} PayoutItemCreate
 * @typedef {import('@prisma/client').Prisma.PayoutItemUpdateInput} PayoutItemUpdate
 * @typedef {import('@prisma/client').Prisma.PayoutItemWhereUniqueInput} PayoutItemWhereUnique
 */

export {};
