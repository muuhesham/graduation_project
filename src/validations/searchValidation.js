// @ts-check

import { query } from 'express-validator';
import SearchErrors from '../constants/messages/errors/search.js';
import { normalizeSearchQueryInput, normalizeSearchTagValues } from '../types/dtos/search.dto.js';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

class SearchValidation {
    /** @type {ValidationChain[]} */
    search = [
        query('q')
            .optional({ checkFalsy: true })
            .customSanitizer((value, { req }) => {
                req.query ??= {};

                const {
                    query: normalizedQuery,
                    pageOverride,
                    limitOverride,
                } = normalizeSearchQueryInput(value || '');

                if (!req.query.page && pageOverride) {
                    req.query.page = pageOverride;
                }

                if (!req.query.limit && limitOverride) {
                    req.query.limit = limitOverride;
                }

                return normalizedQuery;
            })
            .trim()
            .isLength({ min: 2 })
            .withMessage(SearchErrors.QUERY_MIN_LENGTH.message)
            .isLength({ max: 200 })
            .withMessage(SearchErrors.QUERY_MAX_LENGTH.message),
        query('page')
            .optional()
            .default(1)
            .toInt()
            .isInt({ min: 1 })
            .withMessage(SearchErrors.PAGE_POSITIVE_INTEGER.message),
        query('limit')
            .optional()
            .default(10)
            .toInt()
            .isInt({ min: 1, max: 50 })
            .withMessage(SearchErrors.LIMIT_RANGE.message),

        query('categoryId')
            .optional()
            .toInt()
            .isInt({ min: 1 })
            .withMessage(SearchErrors.CATEGORY_ID_POSITIVE_INTEGER.message),
        query('organizerId')
            .optional()
            .trim()
            .customSanitizer((value) => (typeof value === 'string' ? value.trim() : value))
            .isString()
            .withMessage(SearchErrors.ORGANIZER_ID_STRING.message),

        query('minPrice')
            .optional()
            .toFloat()
            .isFloat({ min: 0 })
            .withMessage(SearchErrors.MIN_PRICE_POSITIVE.message),
        query('maxPrice')
            .optional()
            .toFloat()
            .isFloat({ min: 0 })
            .withMessage(SearchErrors.MAX_PRICE_POSITIVE.message),

        query('hasSeatMap')
            .optional()
            .toBoolean()
            .isBoolean()
            .withMessage(SearchErrors.HAS_SEAT_MAP_BOOLEAN.message),

        query(['tag', 'tags'])
            .optional()
            .customSanitizer((value, { req, path }) => {
                const normalized = normalizeSearchTagValues(value);

                req.query ??= {};
                req.query[path] = normalized;

                return normalized;
            })
            .custom((value) => {
                const values = Array.isArray(value) ? value : [value];
                return values.every(
                    (entry) => typeof entry === 'string' && entry.length > 0 && entry.length <= 50
                );
            })
            .withMessage('Tags must be non-empty strings with a maximum length of 50 characters'),
    ];
}

export default new SearchValidation();
export { SearchValidation };
