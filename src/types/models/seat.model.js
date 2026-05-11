/**
 * @typedef {object} SeatData
 * @property {number} id
 * @property {number} eventId
 * @property {number | null} tierNumber
 * @property {number} rowIndex
 * @property {number} seatIndex
 * @property {boolean} isSold
 */

/**
 * @typedef {SeatData} Seat
 */

/**
 * @typedef {object} SeatCreate
 * @property {number} eventId
 * @property {number | null} [tierNumber]
 * @property {number} rowIndex
 * @property {number} seatIndex
 * @property {boolean} [isSold]
 */

/**
 * @typedef {Partial<SeatCreate>} SeatUpdate
 */

/**
 * @typedef {object} SeatWhereUnique
 * @property {number} [id]
 */

/**
 * @typedef {import('@prisma/client').Prisma.EventSeatSelect} SeatSelect
 * @typedef {import('@prisma/client').Prisma.EventSeatInclude} SeatInclude
 */

export {};
