//@ts-check

/** @typedef {import('./ICast.js').default} ICast */
/** @typedef {typeof import('./ICast.js').default} CastClass */

/**
 * @typedef {object} CastDefinition
 * @property {string} field
 * @property {CastClass} cast
 */

/**
 * @interface ICastableModel
 */
export default class ICastableModel {
    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        throw new Error('Method not implemented');
    }
}
