/** Search error messages for cases requiring specific frontend handling */

const SearchErrors = Object.freeze({
    SEARCH_FAILED: {
        code: 'SEARCH_FAILED',
        message: 'Search operation failed. Please try again',
    },
    SEARCH_QUERY_REQUIRED: {
        code: 'INVALID_QUERY',
        message: 'Search query is required',
    },
    INVALID_EMBEDDING: {
        code: 'INVALID_EMBEDDING',
        message: 'Invalid embedding provided',
    },
    SEMANTIC_SEARCH_FAILED: {
        code: 'SEMANTIC_SEARCH_FAILED',
        message: 'Semantic search failed. Using fallback search.',
    },
    QUERY_MIN_LENGTH: {
        code: 'INVALID_QUERY_MIN_LENGTH',
        message: 'Search query must be at least 2 characters',
    },
    QUERY_MAX_LENGTH: {
        code: 'INVALID_QUERY_MAX_LENGTH',
        message: 'Search query must not exceed 200 characters',
    },
    PAGE_POSITIVE_INTEGER: {
        code: 'INVALID_PAGE',
        message: 'Page must be a positive integer',
    },
    LIMIT_RANGE: {
        code: 'INVALID_LIMIT',
        message: 'Limit must be between 1 and 50',
    },
    CATEGORY_ID_POSITIVE_INTEGER: {
        code: 'INVALID_CATEGORY_ID',
        message: 'Category ID must be a positive integer',
    },
    ORGANIZER_ID_STRING: {
        code: 'INVALID_ORGANIZER_ID',
        message: 'Organizer ID must be a string',
    },
    MIN_PRICE_POSITIVE: {
        code: 'INVALID_MIN_PRICE',
        message: 'Minimum price must be a positive number',
    },
    MAX_PRICE_POSITIVE: {
        code: 'INVALID_MAX_PRICE',
        message: 'Maximum price must be a positive number',
    },
    HAS_SEAT_MAP_BOOLEAN: {
        code: 'INVALID_HAS_SEAT_MAP',
        message: 'hasSeatMap must be a boolean value',
    },
});

export default SearchErrors;
