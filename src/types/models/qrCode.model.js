/**
 * @typedef {object} QrCodeData
 * @property {string} id
 * @property {string} ticketId
 * @property {string} codePath
 * @property {string} codeDisk
 * @property {boolean} isActive
 * @property {string} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {QrCodeData} QrCode
 */

/**
 * @typedef {object} QrCodeCreate
 * @property {string} ticketId
 * @property {string} codePath
 * @property {string} [codeDisk]
 * @property {boolean} [isActive]
 * @property {string} [status]
 */

/**
 * @typedef {Partial<QrCodeCreate>} QrCodeUpdate
 */

/**
 * @typedef {object} QrCodeWhereUnique
 * @property {string} [id]
 * @property {string} [ticketId]
 */

/**
 * @typedef {import('@prisma/client').Prisma.QrCodeSelect} QrCodeSelect
 * @typedef {import('@prisma/client').Prisma.QrCodeInclude} QrCodeInclude
 */

export {};
