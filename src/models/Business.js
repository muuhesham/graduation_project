//@ts-check

import BaseModel from './BaseModel.js';

import { pluck } from './../helpers/pluck.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 *
 * @typedef {import('./../types/dtos').BusinessCreateDTO} BusinessCreateDTO
 *
 * @typedef {import('./../types/models/index.js').IOrganizer} IOrganizer
 */

/** @implements {IOrganizer} */
export default class Business extends BaseModel {
    /**
     * @param {string} organizerId
     * @param {BusinessCreateDTO} data
     * @param {PrismaClient | TransactionClient} tx
     */
    create(organizerId, data, tx) {
        const validated = this.validate(data);
        return tx.business.create({
            data: {
                organizerId,
                ...validated,
            },
        });
    }

    /**
     * @private
     * @param {BusinessCreateDTO} data
     * @returns {{ commercialRegistration: string; taxId: string }}
     */
    validate(data) {
        return /** @type {{ commercialRegistration: string; taxId: string }} */ (
            pluck(data, ['commercialRegistration', 'taxId'])
        );
    }
}
