//@ts-check

import BaseRepository from './BaseRepository.js';
import { EventSeatTier } from './../models/index.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 * @typedef {import('./../types/models').EventSeatTier} EventSeatTierType
 * @typedef {import('./../types/models').EventSeatTierCreate} EventSeatTierCreate
 * @typedef {import('./../types/models').EventSeatTierUpdate} EventSeatTierUpdate
 * @typedef {import('./../types/models').EventSeatTierWhereUnique} EventSeatTierWhereUnique
 * @typedef {import('./../types/models').EventSeatTierSelect} EventSeatTierSelect
 * @typedef {import('./../types/models').EventSeatTierInclude} EventSeatTierInclude
 */

/**
 * @extends {BaseRepository<EventSeatTierType, EventSeatTierCreate, EventSeatTierUpdate, EventSeatTierWhereUnique, EventSeatTierSelect, EventSeatTierInclude, any>}
 */
export default class EventSeatTierRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, EventSeatTier);
    }

    /**
     * @param {number} eventId
     * @param {object} options
     * @param {any[]} options.priceTiers
     * @param {number} options.numberOfRows
     * @param {number} options.numberOfColumns
     * @param {TransactionClient | null} [tx]
     */
    async createEventSeatTiers(eventId, { priceTiers, numberOfRows, numberOfColumns }, tx = null) {
        if (!priceTiers || !Array.isArray(priceTiers)) {
            return { count: 0 };
        }

        /** @type {EventSeatTierCreate[]} */
        const data = priceTiers.map((priceTier, index) => ({
            tierNumber: priceTier.id !== undefined ? Number(priceTier.id) : index,
            name: String(priceTier.name),
            price: Number(priceTier.price),
            color: String(priceTier.color),
            numberOfRows: Number(numberOfRows),
            numberOfColumns: Number(numberOfColumns),
            eventId,
        }));

        return this.bulkInsert({ data }, tx);
    }
}
