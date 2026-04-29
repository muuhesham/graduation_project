//@ts-check

import { OllamaEmbeddings } from '@langchain/ollama';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OLLAMA_BASE_URL, OLLAMA_DIMENSION, OLLAMA_MODEL } from '../config/env.js';

import AIErrors from './../constants/errors/ai.js';
import AppError from './../errors/AppError.js';
import TimeoutError from './../errors/TimeoutError.js';
import ValidationError from './../errors/ValidationError.js';

/**
 * @typedef {object} AIServiceOptions
 * @property {string} [model]
 * @property {string} [baseUrl]
 * @property {number} [dimension]
 */

/**
 * @typedef {object} AIServiceDeps
 * @property {AIServiceOptions} [options]
 */

/**
 * @typedef {object} VectorStoreColumns
 * @property {string} idColumnName
 * @property {string} contentColumnName
 * @property {string} metadataColumnName
 * @property {string} vectorColumnName
 */

/**
 * @typedef {object} CreateVectorStoreOptions
 * @property {string} connectionString
 * @property {string} tableName
 * @property {VectorStoreColumns} columns
 * @property {'similarity' | 'distance'} [scoreNormalization]
 */

class AIService {
    /** @type {OllamaEmbeddings | null} */
    #embeddings = null;

    #dimension;
    #model;
    #baseUrl;

    /** @param {AIServiceDeps} [deps] */
    constructor({ options = {} } = {}) {
        this.#model = options.model || OLLAMA_MODEL;
        this.#baseUrl = options.baseUrl || OLLAMA_BASE_URL;
        this.#dimension = options.dimension || OLLAMA_DIMENSION;
    }

    /** @returns {OllamaEmbeddings} */
    getEmbeddings() {
        if (!this.#embeddings) {
            this.#embeddings = new OllamaEmbeddings({
                model: this.#model,
                baseUrl: this.#baseUrl,
            });
        }
        return this.#embeddings;
    }

    /**
     * @param {string} text
     * @returns {Promise<number[]>}
     */
    async embed(text) {
        this.#validateText(text);

        try {
            return await this.getEmbeddings().embedQuery(text);
        } catch (error) {
            if (error instanceof Error && (error.name === 'AbortError' || error.message.toLowerCase().includes('timeout'))) {
                throw new TimeoutError(AIErrors.OLLAMA_TIMEOUT.message, AIErrors.OLLAMA_TIMEOUT.code);
            }

            throw new AppError(AIErrors.OLLAMA_UNAVAILABLE.message, 503, AIErrors.OLLAMA_UNAVAILABLE.code);
        }
    }

    /**
     * @param {string[]} texts
     * @returns {Promise<number[][]>}
     */
    async embedBatch(texts) {
        this.#validateTexts(texts);

        try {
            return await this.getEmbeddings().embedDocuments(texts);
        } catch (error) {
            if (error instanceof Error && (error.name === 'AbortError' || error.message.toLowerCase().includes('timeout'))) {
                throw new TimeoutError(AIErrors.OLLAMA_TIMEOUT.message, AIErrors.OLLAMA_TIMEOUT.code);
            }

            throw new AppError(AIErrors.OLLAMA_UNAVAILABLE.message, 503, AIErrors.OLLAMA_UNAVAILABLE.code);
        }
    }

    /** @returns {number} */
    getDimension() {
        return this.#dimension;
    }

    /** @param {CreateVectorStoreOptions} options */
    createVectorStore(options) {
        const { connectionString, tableName, columns, scoreNormalization = 'similarity' } = options;

        return PGVectorStore.initialize(this.getEmbeddings(), {
            postgresConnectionOptions: { connectionString },
            tableName,
            columns,
            dimensions: this.getDimension(),
            scoreNormalization,
        });
    }

    #validateText(text) {
        if (!text || typeof text !== 'string') {
            throw new ValidationError([], AIErrors.INVALID_EMBED_TEXT.message, AIErrors.INVALID_EMBED_TEXT.code);
        }
    }

    #validateTexts(texts) {
        if (!Array.isArray(texts) || !texts.length || texts.some(t => typeof t !== 'string' || !t.trim().length)) {
            throw new ValidationError([], AIErrors.INVALID_EMBED_TEXTS.message, AIErrors.INVALID_EMBED_TEXTS.code);
        }
    }
}

export default new AIService({
    options: {
        model: OLLAMA_MODEL,
        baseUrl: OLLAMA_BASE_URL,
        dimension: OLLAMA_DIMENSION,
    },
});
export { AIService };
