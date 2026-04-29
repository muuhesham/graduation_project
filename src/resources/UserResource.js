//@ts-check

import BaseResource from './BaseResource.js';
import { makePagination } from './helpers/pagination.js';

/**
 * @typedef {import('./../types/models').User} User
 * @typedef {import('./../types/models').UserResourceData} UserResourceData
 */

/**
 * @extends {BaseResource}
 */
export default class UserResource extends BaseResource {
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
        return {
            id: user.id ?? null,
            name: user.name ?? null,
            email: user.email ?? null,
            gender: user.gender ?? null,
            phone: user.phone ?? null,
            role: user.role ?? null,
            location: user.location ?? null,
            languagePreference: user.languagePreference ?? null,
            isVerified: user.isVerified ?? false,
            isCompleted: user.isCompleted ?? false,
            birthDate: user.birthDate ?? null,
            createdAt: user.createdAt ?? null,
            updatedAt: user.updatedAt ?? null,
        };
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
     * @returns {import('./../types/models').AdminUserPaginatedResource}
     */
    static paginate(result) {
        return {
            users: this.collection(result?.data || []),
            pagination: makePagination(result?.pagination ?? result?.meta),
        };
    }
}
