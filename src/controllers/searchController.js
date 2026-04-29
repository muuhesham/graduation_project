//@ts-check

import asyncWrapper from './../middlewares/asyncWrapper.js';
import { sendSuccess } from './../utils/response.js';
import { pickSearchFilters } from '../types/dtos/search.dto.js';
import searchService from '../services/searchService.js';
import SearchResource from '../resources/SearchResource.js';

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('../types/search.types.js').SearchFilters} SearchFilters
 * @typedef {import('../types/search.types.js').ValidatedSearchQuery} ValidatedSearchQuery
 * @typedef {Request & { query: ValidatedSearchQuery }} SearchRequest
 */

class SearchController {
    /** @type {typeof searchService} */
    #searchService;

    /**
     * @param {typeof searchService} searchService
     */
    constructor(searchService) {
        this.#searchService = searchService;
    }

    /**
     * Search events with semantic-first fallback
     * GET /api/v1/search?q=music%20festival&page=1&limit=10&categoryId=1&minPrice=10&maxPrice=100
     */
    search = asyncWrapper(
        /**
         * @param {SearchRequest} req
         * @param {Response} res
         */
        async (req, res) => {
            const { q: query, page, limit } = req.query;
            const filters = pickSearchFilters(req.query);

            const result = await this.#searchService.search({
                query,
                page,
                limit,
                filters,
            });

            return sendSuccess(res, SearchResource.paginate(result));
        }
    );
}

export default new SearchController(searchService);
export { SearchController };
