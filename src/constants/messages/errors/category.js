//@ts-check

/**
 * @typedef {import('./common').ErrorDescriptor} ErrorDescriptor
 */

/** @type {Record<string, ErrorDescriptor>} */
const CategoryErrors = Object.freeze({
    CATEGORY_NOT_FOUND: {
        code: 'CATEGORY_NOT_FOUND',
        message: 'The specified category was not found.',
    },
    CATEGORY_ALREADY_EXISTS: {
        code: 'CATEGORY_ALREADY_EXISTS',
        message: 'A category with this name already exists.',
    },
});

export default CategoryErrors;
