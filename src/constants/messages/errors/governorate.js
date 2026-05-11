const GovernorateErrors = Object.freeze({
    GOVERNORATE_NOT_FOUND: {
        code: 'GOVERNORATE_NOT_FOUND',
        message: 'The specified governorate was not found.',
    },

    INVALID_GOVERNORATE_NAME: {
        code: 'INVALID_GOVERNORATE_NAME',
        message: 'The provided governorate name is invalid or not supported.',
    },

    GOVERNORATE_MAPPING_FAILED: {
        code: 'GOVERNORATE_MAPPING_FAILED',
        message: 'Could not map the provided location to a valid governorate.',
    },
});

export default GovernorateErrors;
