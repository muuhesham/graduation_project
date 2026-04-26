//@ts-check

/**
 * Base contract for a cast type.
 * Concrete casts implement a static `cast(value)` method and can be passed as class names.
 *
 * @interface ICast
 */
export default class ICast {
    /**
     * @param {any} _value
     * @returns {any}
     */
    static cast(_value) {
        throw new Error('Method not implemented');
    }
}
