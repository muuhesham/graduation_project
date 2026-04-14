//@ts-check

import { Auth } from 'googleapis';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').User} User
 */

/**
 * @typedef {object} AuthenticatedRequest
 * @property {User} user
 * @property {Auth.OAuth2Client} authClient
 */
export {};
