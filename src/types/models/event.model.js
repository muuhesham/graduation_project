//@ts-check

/**
 * @typedef {import('@prisma/client').Event} EventData
 * @typedef {import('@prisma/client').Prisma.EventCreateInput} EventCreate
 * @typedef {import('@prisma/client').Prisma.EventUpdateInput} EventUpdate
 * @typedef {import('@prisma/client').Prisma.EventWhereUniqueInput} EventWhereUnique
 * @typedef {import('@prisma/client').Prisma.EventWhereInput} EventWhere
 * @typedef {import('@prisma/client').Prisma.EventSelect} EventSelect
 * @typedef {import('@prisma/client').Prisma.EventInclude} EventInclude
 * @typedef {import('@prisma/client').Prisma.EventDefaultArgs} EventDefaultArgs
 * @typedef {import('./../shared/common.types').RepositoryProjection<EventSelect, EventInclude, EventDefaultArgs['omit']>} EventProjection
 * @typedef {import('./../shared/common.types').RepositoryReadOptions<EventWhere, EventSelect, EventInclude, EventDefaultArgs['omit']>} EventReadOptions
 * @typedef {EventReadOptions & { 
 *  q?: string,
 *  type?: import('@prisma/client').$Enums.EventType,
 *  mode?: import('@prisma/client').$Enums.EventMode,
 *  organizerId?: string,
 *  venueId?: number,
 *  categoryId?: number,
 *  hasSeatMap?: boolean
 * }} EventFilters
 */

/** @typedef {import('@prisma/client').Prisma.EventGetPayload<{ include: { category: true, venue: true, organizer: true, ticketTypes: true, eventTags: { include: { tag: true } } } }>} EventWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/Event').default>} EventLogic */
/** @typedef {EventWithRelations & EventLogic} Event */
/** @typedef {Event} EventHydrated */

/**
 * @typedef {object} EventResourceData
 * @property {number | null} id
 * @property {string | null} organizerId
 * @property {number | null} venueId
 * @property {number | null} categoryId
 * @property {string | null} slug
 * @property {string | null} title
 * @property {string | null} description
 * @property {string | null} bannerUrl
 * @property {import('@prisma/client').$Enums.EventType | null} type
 * @property {import('@prisma/client').$Enums.EventMode | null} mode
 * @property {import('./category.model').CategoryResourceData | null} [category]
 * @property {import('./venue.model').VenueResourceData | null} [venue]
 * @property {string[]} [tags]
 * @property {boolean} hasSeatMap
 * @property {Date | null} deletedAt
 * @property {number | null} [pendingOrders]
 * @property {number | null} [completedOrders]
 * @property {number | null} [issuedTickets]
 * @property {number | null} [activeSeatReservations]
 * @property {boolean | null} [canBeDeleted]
 * @property {boolean | null} [canBeModified]
 * @property {Date | null} createdAt
 * @property {Date | null} updatedAt
 */

/** @typedef {import('./../shared/common.types').PaginatedResult<EventResourceData>} EventPaginatedResource */

/**
 * @typedef {object} AdminEventPaginatedResource
 * @property {EventResourceData[]} events
 * @property {import('./../shared/common.types').PaginationMeta} pagination
 * @property {object} summary
 * @property {number} summary.totalCandidates
 * @property {number} summary.returned
 */

/**
 * @typedef {object} EventRevenueResourceData
 * @property {number} total
 */

export {};
