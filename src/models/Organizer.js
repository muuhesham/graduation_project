//@ts-check

import BaseModel from './BaseModel.js';
import { dateCast, numberCast, stringCast } from './casts.js';

import { pluck } from './../helpers/pluck.js';

import ValidationError from './../errors/ValidationError.js';

/** @typedef {import('./contracts/ICastableModel.js').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models/organizer.model.js').Organizer} OrganizerDataType */
/** @typedef {import('./../types/dtos/index.js').OrganizerCreateDTO} OrganizerCreateDTO */

/** @extends {BaseModel<OrganizerDataType>} */
class Organizer extends BaseModel {
    /**
     * @param {OrganizerDataType} data
     */
    constructor(data) {
        super(data);
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: stringCast },
            { field: 'userId', cast: stringCast },
            { field: 'name', cast: stringCast },
            { field: 'type', cast: stringCast },
            { field: 'contactEmail', cast: stringCast },
            { field: 'contactPhone', cast: stringCast },
            { field: 'status', cast: stringCast },
            { field: 'verificationStatus', cast: stringCast },
            { field: 'reviewedBy', cast: numberCast },
            { field: 'reviewedAt', cast: dateCast },
            { field: 'createdAt', cast: dateCast },
            { field: 'updatedAt', cast: dateCast },
        ];
    }

    /**
     * @param {OrganizerCreateDTO} data
     * @param {import('@prisma/client').Prisma.TransactionClient} tx
     */
    static create(data, tx) {
        const validated = /** @type {OrganizerCreateDTO} */ (pluck(data, ['name', 'type']));
        Organizer.validate(validated);
        return tx.organizer.create({ data });
    }

    /**
     * @private
     * @param {OrganizerCreateDTO} data
     */
    static validate(data) {
        const errors = [];
        if (!data.name) {
            errors.push('Name is required');
        }
        if (!data.type) {
            errors.push('Type is required');
        }
        if (errors.length > 0) {
            throw new ValidationError(errors, 'Invalid organizer data');
        }
    }

    static get resourceName() {
        return 'organizer';
    }

    /**
     * @returns {string}
     */
    static get softDeleteField() {
        return 'deletedAt';
    }
}

/** @type {typeof Organizer & (new (data: OrganizerDataType) => Organizer & OrganizerDataType)} */
const OrganizerExport = /** @type {any} */ (Organizer);
export default OrganizerExport;
