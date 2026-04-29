//@ts-check

/**
 * @typedef {import('@prisma/client').Order} OrderData
 * @typedef {import('@prisma/client').Prisma.OrderCreateInput} OrderCreate
 * @typedef {import('@prisma/client').Prisma.OrderUpdateInput} OrderUpdate
 * @typedef {import('@prisma/client').Prisma.OrderWhereUniqueInput} OrderWhereUnique
 * @typedef {import('@prisma/client').Prisma.OrderWhereInput} OrderWhere
 * @typedef {import('@prisma/client').Prisma.OrderSelect} OrderSelect
 * @typedef {import('@prisma/client').Prisma.OrderInclude} OrderInclude
 * @typedef {import('@prisma/client').Prisma.OrderDefaultArgs} OrderDefaultArgs
 * @typedef {import('./../shared/common.types.js').RepositoryProjection<OrderSelect, OrderInclude, OrderDefaultArgs['omit']>} OrderProjection
 * @typedef {import('./../shared/common.types.js').RepositoryReadOptions<OrderWhere, OrderSelect, OrderInclude, OrderDefaultArgs['omit']>} OrderReadOptions
 */

/** @typedef {import('@prisma/client').Prisma.OrderGetPayload<{ include: { orderItems: { include: { ticketType: { include: { event: { include: { organizer: true } } } } } } } }>} OrderWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/Order.js').default>} OrderLogic */
/** @typedef {OrderWithRelations & OrderLogic} Order */
/** @typedef {Order} OrderHydrated */

/**
 * @typedef {import('@prisma/client').OrderItem} OrderItemData
 * @typedef {import('@prisma/client').Prisma.OrderItemCreateInput} OrderItemCreate
 * @typedef {import('@prisma/client').Prisma.OrderItemUpdateInput} OrderItemUpdate
 * @typedef {import('@prisma/client').Prisma.OrderItemWhereUniqueInput} OrderItemWhereUnique
 */

/** @typedef {import('@prisma/client').Prisma.OrderItemGetPayload<{ include: { ticketType: { include: { event: { include: { organizer: true } } } } } }>} OrderItemWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/OrderItem.js').default>} OrderItemLogic */
/** @typedef {OrderItemWithRelations & OrderItemLogic} OrderItem */

export {};
