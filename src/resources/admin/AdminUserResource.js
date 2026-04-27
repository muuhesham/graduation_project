//@ts-check

import BaseResource from './../BaseResource.js';
import UserResource from './../UserResource.js';
import { makePagination } from '../helpers/pagination.js';

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
     * @returns {UserResourceData | null}
     */
    static make(user) {
        return super.make(user);
    }

    /**
     * @param {User | any} user
     * @returns {UserResourceData}
     */
    static toArray(user) {
        return UserResource.toArray(user);
    }

    /**
     * @param {User[]} items
     * @returns {UserResourceData[]}
     */
    static collection(items) {
        return super.collection(items);
    }

    /**
     * @param {any} result
     * @param {string} [dataKey]
     * @returns {any}
     */
    static paginate(result, dataKey = 'users') {
        return super.paginate(result, dataKey);
    }
}
