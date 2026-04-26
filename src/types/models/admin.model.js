//@ts-check

/**
 * @typedef {import('@prisma/client').Admin & { isApproved: boolean }} AdminData
 * @typedef {import('@prisma/client').AdminRefreshToken} AdminRefreshToken
 * @typedef {import('@prisma/client').Prisma.AdminCreateInput} AdminCreate
 * @typedef {import('@prisma/client').Prisma.AdminWhereUniqueInput} AdminWhereUnique
 * @typedef {import('@prisma/client').Prisma.AdminWhereInput} AdminWhere
 * @typedef {import('@prisma/client').Prisma.AdminUpdateInput} AdminUpdate
 * @typedef {import('@prisma/client').Prisma.AdminSelect} AdminSelect
 * @typedef {import('@prisma/client').Prisma.AdminInclude} AdminInclude
 * @typedef {import('@prisma/client').Prisma.AdminDefaultArgs} AdminDefaultArgs
 * @typedef {import('./../shared/common.types.js').RepositoryProjection<AdminSelect, AdminInclude, AdminDefaultArgs['omit']>} AdminProjection
 * @typedef {import('./../shared/common.types.js').RepositoryReadOptions<AdminWhere, AdminSelect, AdminInclude, AdminDefaultArgs['omit']>} AdminReadOptions
 */

/** @typedef {import('@prisma/client').Prisma.AdminGetPayload<{ include: { reviewedOrganizers: true } }>} AdminWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/Admin.js').default>} AdminLogic */
/** @typedef {AdminWithRelations & AdminLogic} Admin */
/** @typedef {Admin} AdminHydrated */
/** @typedef {AdminRefreshToken & { admin?: Admin | null }} AdminRefreshTokenRecord */

/**
 * @typedef {object} AdminActiveUsersResourceData
 * @property {number} activeUsers
 */

/**
 * @typedef {object} AdminDashboardSummaryResourceData
 * @property {object} users
 * @property {number} users.total
 * @property {number} users.deleted
 * @property {number} users.activeInPeriod
 * @property {object} organizers
 * @property {number} organizers.total
 * @property {number} organizers.pendingReview
 * @property {object} events
 * @property {number} events.total
 * @property {object} orders
 * @property {number} orders.total
 * @property {number} orders.completed
 * @property {number} orders.pending
 * @property {number} orders.cancelled
 * @property {number} orders.revenue
 */

/**
 * @typedef {object} AdminPayoutResourceData
 * @property {number} processedBy
 * @property {string} processedAt
 * @property {object} window
 * @property {number} window.days
 * @property {string} window.from
 * @property {string} window.to
 * @property {object} totals
 * @property {number} totals.organizers
 * @property {number} totals.orders
 * @property {number} totals.grossAmount
 * @property {Array<{ organizerId: string, organizerName: string | null, organizerEmail: string | null, grossAmount: number, ordersCount: number, ticketsSold: number }>} payouts
 */

export {};
