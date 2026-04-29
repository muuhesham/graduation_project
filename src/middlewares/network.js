//@ts-check

import ForbiddenError from './../errors/ForbiddenError.js';

/**
 * @typedef {import('./../types/express/request.types.js').ExpressRequest} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function restrictToLocalhost(req, res, next) {
    const remoteAddress = req.ip || req.socket?.remoteAddress;

    const isLocal =
        remoteAddress === '127.0.0.1' ||
        remoteAddress === '::1' ||
        remoteAddress === '::ffff:' ||
        remoteAddress === '::ffff:127.0.0.1';

    if (!isLocal) {
        throw new ForbiddenError();
    }

    next();
}
