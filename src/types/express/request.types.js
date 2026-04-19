//@ts-check

/** @typedef {import('express').Request} ExpressRequest */

/**
 * Base request with user
 *
 * @template Body
 * @typedef {ExpressRequest & {
 *     user: import('./common.types.js').AuthUser;
 *     body: Body;
 * }} AuthenticatedRequest
 */

/**
 * Request with file upload
 *
 * @template Body
 * @typedef {AuthenticatedRequest<Body> & {
 *     file?: import('./common.types.js').MulterFile;
 * }} AuthenticatedFileRequest
 */

export {};
