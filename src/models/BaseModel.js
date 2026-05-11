//@ts-check

/**
 * @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition
 * @typedef {import('./contracts/ICastableModel').CastClass} CastClass
 */

/**
 * @typedef {typeof BaseModel | [typeof BaseModel]} RelationDefinition
 */

/**
 * @abstract
 * @template T
 */
export default class BaseModel {
    /**
     * @param {T | Record<string, any>} [data]
     */
    constructor(data) {
        this.hydrate(data);
    }

    /**
     * Hydrates model data then applies field casts declared by the model.
     * @param {T | Record<string, any> | undefined} data
     */
    hydrate(data) {
        if (!data) return;

        const relations = /** @type {typeof BaseModel} */ (this.constructor).relations;
        const model = /** @type {any} */ (this);

        for (const [key, value] of Object.entries(data)) {
            if (relations[key] && value !== null) {
                const definition = relations[key];

                if (Array.isArray(definition)) {
                    const ModelClass = definition[0];
                    model[key] = Array.isArray(value)
                        ? value.map((item) => new ModelClass(item))
                        : [];
                } else {
                    const ModelClass = definition;
                    model[key] = new ModelClass(value);
                }
            } else {
                model[key] = value;
            }
        }

        this.applyCasts();
    }

    /**
     * Define model relations mapping.
     * @returns {Record<string, RelationDefinition>}
     */
    static get relations() {
        return {};
    }

    /**
     * Apply model-defined casts over hydrated properties.
     */
    applyCasts() {
        const definitions =
            /** @type {typeof BaseModel} */ (this.constructor).getCastDefinitions() || [];
        const model = /** @type {Record<string, any>} */ (this);

        for (const definition of definitions) {
            if (!definition?.field) continue;

            if (Object.prototype.hasOwnProperty.call(this, definition.field)) {
                model[definition.field] = /** @type {typeof BaseModel} */ (
                    this.constructor
                ).castValue(model[definition.field], definition.cast);
            }
        }
    }

    /**
     * Cast contract to be overridden by models that need hydration casts.
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [];
    }

    /**
     * @param {any} value
     * @param {CastClass | undefined} cast
     */
    static castValue(value, cast) {
        if (!cast) return value;
        return cast.cast(value);
    }

    /**
     * @abstract
     * The name of the resource in the database (e.g., 'user', 'admin').
     * Must be overridden by child classes.
     * @returns {string}
     */
    static get resourceName() {
        throw new Error(`[Architecture Error]: 'resourceName' not implemented in ${this.name}`);
    }

    /**
     * @abstract
     * The name of the field used for soft deletes.
     * Return null if the model does not support soft deletes.
     * @returns {string|null}
     */
    static get softDeleteField() {
        return null;
    }
}
