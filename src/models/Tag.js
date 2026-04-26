//@ts-check

import BaseModel from './BaseModel.js';
import { numberCast, stringCast } from './casts.js';

/** @typedef {import('./contracts/ICastableModel.js').CastDefinition} CastDefinition */
/** @typedef {import('./../types/models/tag.model.js').TagData} TagType */

/** @extends {BaseModel<TagType>} */
class Tag extends BaseModel {
    /** @param {TagType} data */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'tag';
    }

    /**
     * @return {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [
            { field: 'id', cast: numberCast },
            { field: 'name', cast: stringCast },
        ];
    }

    /**
     * Tag table doesn't implement soft deletes in Prisma schema.
     * @returns {null}
     */
    static get softDeleteField() {
        return null;
    }
}

/** @type {typeof Tag & (new (data: TagType) => Tag & TagType)} */
const TagExport = /** @type {any} */ (Tag);
export default TagExport;
