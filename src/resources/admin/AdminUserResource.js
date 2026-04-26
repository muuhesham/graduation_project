//@ts-check

import BaseResource from './../BaseResource.js';
import UserResource from './../UserResource.js';

/**
 * @typedef {import('./../../types/models').User} User
 * @typedef {import('./../../types/models').UserResourceData} UserResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class AdminUserResource extends BaseResource {
    /**
     * @param {User | any} user
     * @returns {UserResourceData}
     */
    static toArray(user) {
        return UserResource.toArray(user);
    }
}
