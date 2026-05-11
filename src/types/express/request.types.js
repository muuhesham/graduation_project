//@ts-check

/** @typedef {import('express').Request} ExpressRequest */

/**
 * Base request with user
 *
 * @template Body
 * @typedef {ExpressRequest & {
 *     user: import('./common.types').AuthUser;
 *     body: Body;
 * }} AuthenticatedRequest
 */

/**
 * Request with file upload
 *
 * @template Body
 * @typedef {AuthenticatedRequest<Body> & {
 *     file?: import('./common.types').MulterFile;
 * }} AuthenticatedFileRequest
 */

export {};
