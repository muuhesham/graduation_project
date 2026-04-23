const jsend = {
    success(data = null, code = null, message = null) {
        return {
            status: 'success',
            ...(data && { data }),
            ...(code && { code }),
            ...(message && { message }),
        };
    },

    fail(data = null, code = null) {
        const response = {
            status: 'fail',
        };
        if (code) response.code = code;
        if (data) response.data = data;
        return response;
    },

    error(message = 'Internal Server Error', code = null, data = null) {
        const response = {
            status: 'error',
            message,
        };
        if (code) response.code = code;
        if (data) response.data = data;
        return response;
    },
};

export default Object.freeze(jsend);
