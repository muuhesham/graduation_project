//@ts-check

import BaseModel from './BaseModel.js';

import { pluck } from './../helpers/pluck.js';

import ValidationError from './../errors/ValidationError.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 *
 * @typedef {import('./../types/models').Company} CompanyType
 *
 * @typedef {import('./../types/dtos').CompanyCreateDTO} CompanyCreateDTO
 *
 * @typedef {CompanyCreateDTO & {
 *     contactEmail?: string;
 *     officialEmailDomain?: string;
 * }} CompanySubtypeValidationInput
 *
 * @typedef {import('./../types/models/index.js').IOrganizer} IOrganizer
 */

/** @implements {IOrganizer} */
export default class Company extends BaseModel {
    /**
     * @param {string} organizerId
     * @param {CompanySubtypeValidationInput} data
     * @param {PrismaClient | TransactionClient} tx
     * @returns {Promise<CompanyType>}
     */
    create(organizerId, data, tx) {
        const validated = this.validate(data);
        return tx.company.create({
            data: {
                organizerId,
                ...validated,
            },
        });
    }

    /**
     * @private
     * @param {CompanySubtypeValidationInput} data
     * @returns {{ registrationNumber: string; taxId: string; officialDocumentsDisk?: string; officialDocumentsPath?: string }}
     */
    validate(data) {
        const errors = [];
        const blockedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
        const emailDomain = String(data.contactEmail || '')
            .toLowerCase()
            .split('@')[1];
        const officialDomain = String(data.officialEmailDomain || '')
            .toLowerCase()
            .replace(/^@/, '');

        if (emailDomain && blockedDomains.includes(emailDomain)) {
            errors.push('Company contactEmail must use a company domain');
        }

        if (emailDomain && officialDomain && emailDomain !== officialDomain) {
            errors.push('contactEmail domain must match officialEmailDomain');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors, 'Invalid company data');
        }

        return /** @type {{ registrationNumber: string; taxId: string; officialDocumentsDisk?: string; officialDocumentsPath?: string }} */ (
            pluck(data, [
                'registrationNumber',
                'taxId',
                'officialDocumentsDisk',
                'officialDocumentsPath',
            ])
        );
    }
}
