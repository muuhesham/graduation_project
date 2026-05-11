//@ts-check

import BaseModel from './BaseModel.js';

/** @typedef {import('./contracts/ICastableModel').CastDefinition} CastDefinition */
/** @typedef {import('@prisma/client').OrganizerFollower} OrganizerFollowerData */

/**
 * @extends {BaseModel<OrganizerFollowerData>}
 */
class OrganizerFollower extends BaseModel {
    /**
     * @param {OrganizerFollowerData} data
     */
    constructor(data) {
        super(data);
    }

    static get resourceName() {
        return 'organizerFollower';
    }

    static get softDeleteField() {
        return null;
    }

    /**
     * @returns {CastDefinition[]}
     */
    static getCastDefinitions() {
        return [];
    }
}

/** @type {typeof OrganizerFollower & (new (data: OrganizerFollowerData) => OrganizerFollower & OrganizerFollowerData)} */
const OrganizerFollowerExport = /** @type {any} */ (OrganizerFollower);
export default OrganizerFollowerExport;
