//@ts-check

/**
 * Utility function to pluck specified keys from an object.
 *
 * @param {Object} obj - The source object.
 * @param {string[]} keys - The keys to pluck from the object.
 * @returns {Object} A new object containing only the specified keys and their values.
 */
function pluck(obj, keys) {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {});
}

export { pluck };
