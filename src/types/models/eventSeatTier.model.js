/**
 * @typedef {object} EventSeatTierData
 * @property {number} id
 * @property {number} tierNumber
 * @property {number} eventId
 * @property {string} name
 * @property {number | string} price
 * @property {string} color
 * @property {number} numberOfRows
 * @property {number} numberOfColumns
 */

/**
 * @typedef {EventSeatTierData} EventSeatTier
 */

/**
 * @typedef {object} EventSeatTierCreate
 * @property {number} tierNumber
 * @property {number} eventId
 * @property {string} name
 * @property {number | string} price
 * @property {string} color
 * @property {number} numberOfRows
 * @property {number} numberOfColumns
 */

/**
 * @typedef {Partial<EventSeatTierCreate>} EventSeatTierUpdate
 */

/**
 * @typedef {object} EventSeatTierWhereUnique
 * @property {number} [id]
 */

/**
 * @typedef {import('@prisma/client').Prisma.EventSeatTierSelect} EventSeatTierSelect
 * @typedef {import('@prisma/client').Prisma.EventSeatTierInclude} EventSeatTierInclude
 */

export {};
