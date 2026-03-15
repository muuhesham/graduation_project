// @ts-check

import { prisma as prismaClient } from '../config/db.js';

import userService from './userService.js';
import categoryService from './categoryService.js';
import locationService from './locationService.js';

import NotFoundError from './../errors/NotFoundError.js';
import ConflictError from './../errors/ConflictError.js';
import AppError from './../errors/AppError.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 * @typedef {import('@prisma/client').Organization} Organization
 *
 * @typedef {typeof import('./userService.js').default} UserService
 * @typedef {typeof import('./categoryService.js').default} CategoryService
 * @typedef {typeof import('./locationService.js').default} LocationService
 *
 * @typedef {import('./../types/dtos/organization.types.js').OrganizationServiceDeps} OrganizationServiceDeps
 * @typedef {import('./../types/dtos/organization.types.js').CreateOrganizationInput} CreateOrganizationInput
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
 * @property {import('@prisma/client').CompanyType} companyType
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
    /** @type {UserService}*/
    #userService;
    /** @type {CategoryService} */
    #categoryService;
    /** @type {LocationService} */
    #locationService;

    /**
     * @constructor
     * @param {OrganizationServiceDeps} deps
     */
    constructor({ prismaClient, userService, categoryService, locationService }) {
        this.#prismaClient = prismaClient;
        this.#userService = userService;
        this.#categoryService = categoryService;
        this.#locationService = locationService;
    }

    /**
     * @param {CreateOrganizationInput} input
     * @param {PrismaClient | TransactionClient} [tx=this.#prismaClient]
     * @returns {Promise<Organization>}
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
     * @throws {ConflictError}
     * @returns {Promise<void>}
     */
    async #ensureUniqueConstraints({ name, phone, countryId }) {
        const [organizationNameExists, phoneExists, country] = await Promise.all([
            this.#findByName(name),
            this.#userService.findByPhoneNumber(phone),
            this.#locationService.findCountryById(countryId),
        ]);

        if (organizationNameExists) {
            throw new ConflictError('Organization name is already used');
        }

        if (phoneExists) {
            throw new ConflictError('Phone number is already used');
        }

        if (!country) {
            throw new NotFoundError('Country not found');
        }

        if (!country.isSupported) {
            throw new AppError('Organizations cannot be created in unsupported countries', 400);
        }
    }

    /**
     * @param {EnsureReferencesExistInput} input
     * @throws {NotFoundError}
     * @returns {Promise<void>}
     */
    async #ensureReferencesExist({ categoryId, cityId, stateId, countryId }) {
        const [category, city, state, country] = await Promise.all([
            this.#categoryService.findById(categoryId),
            this.#locationService.findCityById(cityId),
            this.#locationService.findStateById(stateId),
            this.#locationService.findCountryById(countryId),
        ]);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        if (!city) {
            throw new NotFoundError('City not found');
        }

        if (!state) {
            throw new NotFoundError('State not found');
        }

        if (!country) {
            throw new NotFoundError('Country not found');
        }

        if (state.countryId !== countryId) {
            throw new NotFoundError('State not found');
        }

        if (city.stateId !== stateId) {
            throw new NotFoundError('City not found');
        }
    }

    /**
     * @param {CreateOrganizationRecordInput} data
     * @param {PrismaClient | TransactionClient} [tx=this.#prismaClient]
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
     * @returns {Promise<Organization | null>}
     */
    #findByName(name) {
        return this.#prismaClient.organization.findFirst({
            where: { name },
        });
    }
}

export default new OrganizationService({
    prismaClient,
    userService,
    categoryService,
    locationService,
});
