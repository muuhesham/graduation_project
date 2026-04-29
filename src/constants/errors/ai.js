//@ts-check

/** AI service-related error messages */
const AIErrors = Object.freeze({
    INVALID_EMBED_TEXT: {
        code: 'INVALID_EMBED_TEXT',
        message: 'Embedding text must be a non-empty string.',
    },

    INVALID_EMBED_TEXTS: {
        code: 'INVALID_EMBED_TEXTS',
        message: 'Embedding texts must be a non-empty array of non-empty strings.',
    },

    TIMEOUT_ERROR: {
        code: 'AI_TIMEOUT',
        message: 'AI service request timed out. Please try again.',
    },

    SERVICE_UNAVAILABLE: {
        code: 'AI_UNAVAILABLE',
        message: 'AI service is currently unavailable. Please try again later.',
    },

    OLLAMA_TIMEOUT: {
        code: 'OLLAMA_TIMEOUT',
        message: 'Ollama request timed out. Please try again.',
    },

    OLLAMA_UNAVAILABLE: {
        code: 'OLLAMA_UNAVAILABLE',
        message: 'Ollama service is currently unavailable.',
    },
});

export default AIErrors;
