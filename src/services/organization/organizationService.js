// @ts-check

import { prisma as prismaClient } from '../../config/db.js';
import { Prisma } from '@prisma/client';

import { PrismaQueryBuilder } from '../../utils/queryBulider.js';

import userService from '../userService.js';
import categoryService from '../categoryService.js';
import locationService from '../locationService.js';

import ValidationError from './../../errors/ValidationError.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 *
 * @typedef {import('@prisma/client').Organization} Organization
 *
 * @typedef {import('@prisma/client').CompanyType} CompanyType
 *
 * @typedef {import('@prisma/client').Prisma.OrganizationSelect} OrganizationSelect
 *
 * @typedef {import('@prisma/client').Prisma.OrganizationInclude} OrganizationInclude
 *
 * @typedef {import('@prisma/client').Prisma.OrganizationWhereInput} OrganizationWhereInput
 *
 * @typedef {typeof import('./../userService.js').default} UserService
 *
 * @typedef {typeof import('./../categoryService.js').default} CategoryService
 *
 * @typedef {typeof import('./../locationService.js').default} LocationService
 *
 * @typedef {import('./../../types/common.types.js').QueryOptions<
 *     OrganizationSelect,
 *     OrganizationInclude,
 *     OrganizationWhereInput
 * >} QueryOptions
 *
 *
 * @typedef {import('./../../types/dtos/organization.types.js').OrganizationServiceDeps} OrganizationServiceDeps
 *
 *
 * @typedef {import('./../../types/dtos/organization.types.js').CreateOrganizationInput} CreateOrganizationInput
 */

/**
 * @typedef {object} EnsureUniqueConstraintsInput
 * @property {string} name
 * @property {string} phone
 * @property {number} countryId
 */

/**
 * @typedef {object} EnsureReferencesExistInput
 * @property {number} categoryId
 * @property {number} cityId
 * @property {number} stateId
 * @property {number} countryId
 */

/**
 * @typedef {object} CreateOrganizationRecordInput
 * @property {string} userId
 * @property {string} name
 * @property {number} categoryId
 * @property {CompanyType} companyType
 * @property {string} registrationNumber
 * @property {string} taxId
 * @property {string} address
 * @property {number} cityId
 * @property {number} stateId
 * @property {number} countryId
 */

class OrganizationService {
    /** @type {PrismaClient} */
    #prismaClient;

    /** @type {UserService} */
    #userService;
    /** @type {CategoryService} */
    #categoryService;
    /** @type {LocationService} */
    #locationService;

    /** @type {string[]} */
    #ALLOWED_SELECTIONS =
        Prisma.dmmf.datamodel.models
            .find((m) => m.name === 'Organization')
            ?.fields.filter((f) => f.kind === 'scalar')
            .map((f) => f.name) || [];

    /** @type {string[]} */
    #ALLOWED_RELATIONS =
        Prisma.dmmf.datamodel.models
            .find((m) => m.name === 'Organization')
            ?.fields.filter((f) => f.kind === 'object')
            .map((f) => f.name) || [];

    /** @param {OrganizationServiceDeps} deps */
    constructor({ prismaClient, userService, categoryService, locationService }) {
        this.#prismaClient = prismaClient;
        this.#userService = userService;
        this.#categoryService = categoryService;
        this.#locationService = locationService;
    }

    /**
     * @param {CreateOrganizationInput} input
     * @param {PrismaClient | TransactionClient} [tx=this.#prismaClient] Default is
     *   `this.#prismaClient`
     * @returns {Promise<Organization>}
     * @throws {ValidationError}
     */
    async create(
        {
            name,
            phone,
            userId,
            categoryId,
            companyType,
            registrationNumber,
            taxId,
            address,
            cityId,
            stateId,
            countryId,
        },
        tx = this.#prismaClient
    ) {
        await Promise.all([
            this.#ensureUniqueConstraints({ name, phone, countryId }),
            this.#ensureReferencesExist({
                categoryId,
                cityId,
                stateId,
                countryId,
            }),
        ]);

        return this.#createOrganization(
            {
                userId,
                name,
                categoryId,
                companyType,
                registrationNumber,
                taxId,
                address,
                cityId,
                stateId,
                countryId,
            },
            tx
        );
    }

    /**
     * @param {string} phone
     * @returns {Promise<Organization | null>}
     */
    findByOwnerPhone(phone) {
        return this.#prismaClient.organization.findFirst({
            where: {
                owner: {
                    phone,
                },
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        isPhoneVerified: true,
                    },
                },
            },
        });
    }

    /**
     * @param {EnsureUniqueConstraintsInput} input
     * @returns {Promise<void>}
     * @throws {ConflictError}
     */
    async #ensureUniqueConstraints({ name, phone, countryId }) {
        const [organizationNameExists, phoneExists, country] = await Promise.all([
            this.findByName(name),
            this.#userService.findByPhoneNumber(phone),
            this.#locationService.findCountryById(countryId),
        ]);

        const errors = [];

        if (organizationNameExists) {
            errors.push({ field: 'name', message: 'Organization name is already used' });
        }

        if (phoneExists) {
            errors.push({ field: 'phone', message: 'Phone number is already used' });
        }

        if (!country) {
            errors.push({ field: 'countryId', message: 'Country not found' });
        }

        if (!country?.isSupported) {
            errors.push({ field: 'countryId', message: 'Country is not supported' });
        }

        if (errors.length > 0) {
            throw new ValidationError('Validation error', errors);
        }
    }

    /**
     * @param {EnsureReferencesExistInput} input
     * @returns {Promise<void>}
     * @throws {NotFoundError}
     */
    async #ensureReferencesExist({ categoryId, cityId, stateId, countryId }) {
        const [category, city, state, country] = await Promise.all([
            this.#categoryService.findById(categoryId),
            this.#locationService.findCityById(cityId),
            this.#locationService.findStateById(stateId),
            this.#locationService.findCountryById(countryId),
        ]);

        const errors = [];
        if (!category) {
            errors.push({ field: 'categoryId', message: 'Category not found' });
        }

        if (!city) {
            errors.push({ field: 'cityId', message: 'City not found' });
        }

        if (!state) {
            errors.push({ field: 'stateId', message: 'State not found' });
        }

        if (!country) {
            errors.push({ field: 'countryId', message: 'Country not found' });
        }

        if (state?.countryId !== countryId) {
            errors.push({ field: 'stateId', message: 'State not found in the specified country' });
        }

        if (city?.stateId !== stateId) {
            errors.push({ field: 'cityId', message: 'City not found in the specified state' });
        }

        if (errors.length > 0) {
            throw new ValidationError('Validation error', errors);
        }
    }

    /**
     * @param {CreateOrganizationRecordInput} data
     * @param {PrismaClient | TransactionClient} [tx=this.#prismaClient] Default is
     *   `this.#prismaClient`
     * @returns {Promise<Organization>}
     */
    #createOrganization(data, tx = this.#prismaClient) {
        return tx.organization.create({
            data,
        });
    }

    /**
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async isVerified(id) {
        const organization = await this.#prismaClient.organization.findUnique({
            where: { id },
            include: {
                owner: { select: { isVerified: true, isPhoneVerified: true } },
            },
        });

        if (!organization) {
            return false;
        }

        return organization.owner.isVerified && organization.owner.isPhoneVerified;
    }

    /**
     * @param {string} name
     * @param {QueryOptions} [options]
     * @returns {Promise<Organization | null>}
     */
    findByName(name, options = {}) {
        const queryBuilder = new PrismaQueryBuilder({
            allowedRelations: this.#ALLOWED_RELATIONS,
            allowedSelections: this.#ALLOWED_SELECTIONS,
        })
            .include(options.include)
            .select(options.select)
            .where({ ...options.filter, name });

        return this.#prismaClient.organization.findFirst(queryBuilder.value);
    }

    /**
     * @param {number} id
     * @param {QueryOptions} [options]
     * @returns {Promise<Organization | null>}
     */
    findById(id, options = {}) {
        const queryBuilder = new PrismaQueryBuilder({
            allowedRelations: this.#ALLOWED_RELATIONS,
            allowedSelections: this.#ALLOWED_SELECTIONS,
        })
            .include(options.include)
            .select(options.select)
            .where({ ...options.filter, id });

        return this.#prismaClient.organization.findUnique(queryBuilder.value);
    }
}

export default new OrganizationService({
    prismaClient,
    userService,
    categoryService,
    locationService,
});
