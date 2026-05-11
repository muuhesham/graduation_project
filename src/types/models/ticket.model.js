/**
 * @typedef {object} TicketData
 * @property {string} id
 * @property {string} userId
 * @property {number} ticketTypeId
 * @property {number | null} eventSeatId
 * @property {string | null} orderId
 * @property {string} orderItemId
 * @property {string} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {TicketData} Ticket
 */

/**
 * @typedef {object} TicketCreate
 * @property {string} userId
 * @property {number} ticketTypeId
 * @property {number | null} [eventSeatId]
 * @property {string | null} [orderId]
 * @property {string} orderItemId
 * @property {string} [status]
 */

/**
 * @typedef {Partial<TicketCreate>} TicketUpdate
 */

/**
 * @typedef {object} TicketWhereUnique
 * @property {string} [id]
 */

/**
 * @typedef {import('@prisma/client').Prisma.TicketSelect} TicketSelect
 * @typedef {import('@prisma/client').Prisma.TicketInclude} TicketInclude
 */

export {};
