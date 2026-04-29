// @ts-check

/**
 * @typedef {import('../models/event.model.js').Event & {
 *     organizerId: string;
 *     title?: string | null;
 *     slug?: string | null;
 *     description?: string | null;
 *     type?: string | null;
 *     mode?: string | null;
 *     categoryId?: number | null;
 *     venueId?: number | null;
 *     hasSeatMap?: boolean | null;
 *     bannerUrl?: string | null;
 *     createdAt?: string | Date | null;
 *     venue?: unknown;
 *     ticketTypes?: unknown[];
 *     eventSessions?: unknown[];
 *     eventSeatTier?: unknown[];
 *     eventSeat?: unknown[];
 *     rules?: string[];
 *     tags?: string[];
 * }} EventResourceInput
 *
 *
 * @typedef {object} EventResourceOutput
 * @property {number | string} id
 * @property {string} organizerId
 * @property {string | null | undefined} title
 * @property {string | null | undefined} slug
 * @property {string | null | undefined} description
 * @property {string | null | undefined} type
 * @property {string | null | undefined} mode
 * @property {number | null | undefined} categoryId
 * @property {number | null | undefined} venueId
 * @property {boolean | null | undefined} hasSeatMap
 * @property {string | null | undefined} bannerUrl
 * @property {string | Date | null | undefined} createdAt
 * @property {unknown | null} venue
 * @property {unknown[]} ticketTypes
 * @property {unknown[]} eventSessions
 * @property {unknown[]} eventSeatTier
 * @property {unknown[]} eventSeat
 * @property {string[]} rules
 * @property {string[]} tags
 */

export {};
