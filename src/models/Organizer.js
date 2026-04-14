//@ts-check

import BaseModel from './BaseModel.js';

import { pluck } from './../helpers/pluck.js';

import ValidationError from './../errors/ValidationError.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 *
 * @typedef {import('./../types/models').Organizer} OrganizerType
 *
 * @typedef {import('./../types/dtos').OrganizerCreateDTO} OrganizerCreateDTO
 */

export default class Organizer extends BaseModel {
    /**
     * @param {OrganizerCreateDTO} data
     * @param {TransactionClient} tx
     */
    create(data, tx) {
        const validated = /** @type {OrganizerCreateDTO} */ pluck(data, ['name', 'type']);
        this.validate(validated);
        return tx.organizer.create({ data });
    }

    /**
     * @private
     * @param {OrganizerCreateDTO} data
     */
    validate(data) {
        const errors = [];
        if (!data.name) {
            errors.push('Name is required');
        }
        if (!data.type) {
            errors.push('Type is required');
        }
        if (errors.length > 0) {
            throw new ValidationError('Invalid organizer data', errors);
        }
    }
}
