//@ts-check

/**
 * @typedef {import('./../shared/common.types').PaginationQuery} PaginationQuery
 * @typedef {import('./../models/event.model').EventProjection} EventProjectionOptions
 */

/**
 * @typedef {object} AdminRegisterDTO
 * @property {string} name
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {object} AdminLoginDTO
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {object} AdminBanUserDTO
 * @property {string} userId
 */

/**
 * @typedef {object} AdminRefreshTokenDTO
 * @property {string} refreshToken
 */

/**
 * @typedef {object} AdminDeleteUserDTO
 * @property {string} userId
 */

/**
 * @typedef {object} AdminRestoreUserDTO
 * @property {string} userId
 */

/**
 * @typedef {object} AdminUserParamsDTO
 * @property {string} userId
 */

/**
 * @typedef {object} AdminTicketsSoldByEventDTO
 * @property {number} eventId
 */

/**
 * @typedef {object} AdminRevenueByEventDTO
 * @property {number} eventId
 */

/**
 * @typedef {object} AdminEventParamsDTO
 * @property {number} eventId
 */

/**
 * @typedef {object} AdminUserFiltersDTO
 * @property {import('@prisma/client').$Enums.Gender} [gender]
 * @property {boolean} [isVerified]
 * @property {import('@prisma/client').$Enums.Language} [languagePreference]
 * @property {boolean} [isCompleted]
 * @property {import('@prisma/client').Prisma.DateTimeFilter} [createdAt]
 */

/** @typedef {AdminUserFiltersDTO & PaginationQuery} AdminListUsersQueryDTO */

/**
 * @typedef {{ status?: import('@prisma/client').$Enums.OrganizerStatus, verificationStatus?: import('@prisma/client').$Enums.OrganizerVerficiationStatus } & PaginationQuery} AdminListOrganizersQueryDTO
 */

/**
 * @typedef {object} AdminEventFiltersDTO
 * @property {string} [q]
 * @property {import('@prisma/client').$Enums.EventType} [type]
 * @property {import('@prisma/client').$Enums.EventMode} [mode]
 * @property {string} [organizerId]
 * @property {number} [venueId]
 * @property {number} [categoryId]
 * @property {boolean} [hasSeatMap]
 */

/** @typedef {AdminEventFiltersDTO & PaginationQuery} AdminListEventsQueryDTO */

/** @typedef {AdminListEventsQueryDTO & EventProjectionOptions} AdminListEventsOptionsDTO */

/**
 * @typedef {object} AdminDashboardSummaryQueryDTO
 * @property {number} [days]
 */

/** @typedef {PaginationQuery} AdminReviewQueueQueryDTO */

/** @typedef {{ days?: number } & PaginationQuery} AdminDashboardOverviewQueryDTO */

/**
 * @typedef {object} AdminOrganizerParamsDTO
 * @property {string} organizerId
 */

/**
 * @typedef {object} AdminRejectOrganizerDTO
 * @property {string} reason
 */

/**
 * @typedef {object} AdminSuspendOrganizerDTO
 * @property {string} reason
 */

/**
 * @typedef {object} AdminProcessPayoutsDTO
 * @property {number} [days]
 */

export {};
