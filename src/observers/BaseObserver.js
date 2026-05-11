//@ts-check

/**
 * @abstract
 * @template T
 */
export default class BaseObserver {
    /**
     * @param {T} model
     * @param {any} [tx]
     */
    async creating(model, tx) {}

    /**
     * @param {T} model
     * @param {any} [tx]
     */
    async created(model, tx) {}

    /**
     * @param {T} model
     * @param {any} [tx]
     */
    async updating(model, tx) {}

    /**
     * @param {T} model
     * @param {any} [tx]
     */
    async updated(model, tx) {}

    /**
     * @param {T} model
     * @param {any} [tx]
     */
    async deleting(model, tx) {}

    /**
     * @param {T} model
     * @param {any} [tx]
     */
    async deleted(model, tx) {}

    /**
     * @param {T} model
     * @param {any} [tx]
     */
    async saving(model, tx) {}

    /**
     * @param {T} model
     * @param {any} [tx]
     */
    async saved(model, tx) {}
}
