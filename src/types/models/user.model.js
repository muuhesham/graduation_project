//@ts-check

import { Auth } from 'googleapis';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 * @typedef {import('@prisma/client').User} UserData
 * @typedef {import('@prisma/client').Prisma.UserCreateInput} UserCreate
 * @typedef {import('@prisma/client').Prisma.UserUpdateInput} UserUpdate
 * @typedef {import('@prisma/client').Prisma.UserWhereUniqueInput} UserWhereUnique
 * @typedef {import('@prisma/client').Prisma.UserWhereInput} UserWhere
 * @typedef {import('@prisma/client').Prisma.UserSelect} UserSelect
 * @typedef {import('@prisma/client').Prisma.UserInclude} UserInclude
 * @typedef {import('@prisma/client').Prisma.UserDefaultArgs} UserDefaultArgs
 * @typedef {import('./../shared/common.types.js').RepositoryProjection<UserSelect, UserInclude, UserDefaultArgs['omit']>} UserProjection
 * @typedef {import('./../shared/common.types.js').RepositoryReadOptions<UserWhere, UserSelect, UserInclude, UserDefaultArgs['omit']>} UserReadOptions
 * @typedef {UserReadOptions & { 
 *  q?: string,
 *  gender?: import('@prisma/client').$Enums.Gender,
 *  isVerified?: boolean,
 *  languagePreference?: import('@prisma/client').$Enums.Language,
 *  isCompleted?: boolean,
 *  createdAt?: import('@prisma/client').Prisma.DateTimeFilter
 * }} UserFilters
 */

/** @typedef {import('@prisma/client').Prisma.UserGetPayload<{ include: { organizer: true, tickets: true, refreshTokens: true, interestedEvents: true, favoriteCategories: true } }>} UserWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/User.js').default>} UserLogic */
/** @typedef {UserWithRelations & UserLogic} User */
/** @typedef {User} UserHydrated */

/**
 * @typedef {object} UserResourceData
 * @property {string | null} id
 * @property {string | null} name
 * @property {string | null} email
 * @property {import('@prisma/client').$Enums.Gender | null} gender
 * @property {string | null} phone
 * @property {import('@prisma/client').$Enums.Role | null} role
 * @property {string | null} location
 * @property {import('@prisma/client').$Enums.Language | null} languagePreference
 * @property {boolean} isVerified
 * @property {boolean} isCompleted
 * @property {Date | null} birthDate
 * @property {Date | null} createdAt
 * @property {Date | null} updatedAt
 */

/** @typedef {import('./../shared/common.types.js').PaginatedResult<UserResourceData>} UserPaginatedResource */

/**
 * @typedef {object} AdminUserPaginatedResource
 * @property {UserResourceData[]} users
 * @property {import('./../shared/common.types.js').PaginationMeta} pagination
 */

/**
 * @typedef {object} AuthenticatedRequest
 * @property {User} user
 * @property {Auth.OAuth2Client} authClient
 */

export {};
