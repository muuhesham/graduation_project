//@ts-check

import BaseModel from './BaseModel.js';

import { pluck } from './../helpers/pluck.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 *
 * @typedef {import('./../types/dtos').HobbyistCreateDTO} HobbyistCreateDTO
 *
 * @typedef {import('./../types/models/index.js').IOrganizer} IOrganizer
 */

/** @implements {IOrganizer} */
export default class Hobbyist extends BaseModel {
    /**
     * @param {string} organizerId
     * @param {HobbyistCreateDTO} data
     * @param {PrismaClient | TransactionClient} tx
     */
    create(organizerId, data, tx) {
        const validated = this.validate(data);
        return tx.hobbyist.create({
            data: {
                ...validated,
                organizerId,
            },
        });
    }

    /**
     * @private
     * @param {HobbyistCreateDTO} data
     * @returns {{ nationalId: string }}
     */
    validate(data) {
        return /** @type {{ nationalId: string }} */ (pluck(data, ['nationalId']));
    }
}
