// @ts-check

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 */

/**
 * @typedef {object} OrganizationServiceDeps
 * @property {PrismaClient} prismaClient
 * @property {typeof import('./../../services/userService.js').default} userService
 * @property {typeof import('./../../services/categoryService.js').default} categoryService
 * @property {typeof import('./../../services/locationService.js').default} locationService
 */

/**
 * @typedef {object} CreateOrganizationInput
 * @property {string} userId
 * @property {string} name
 * @property {string} phone
 * @property {number} categoryId
 * @property {import('@prisma/client').CompanyType} companyType
 * @property {string} registrationNumber
 * @property {string} taxId
 * @property {string} address
 * @property {number} cityId
 * @property {number} stateId
 * @property {number} countryId
 */
export {};
