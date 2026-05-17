//@ts-check

import BaseRepository from './BaseRepository.js';
import { EventSession } from './../models/index.js';
import SessionStatus from './../constants/enums/sessionStatus.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('@prisma/client').EventSession} EventSessionType
 * @typedef {import('@prisma/client').Prisma.EventSessionCreateInput} EventSessionCreate
 * @typedef {import('@prisma/client').Prisma.EventSessionUpdateInput} EventSessionUpdate
 * @typedef {import('@prisma/client').Prisma.EventSessionWhereUniqueInput} EventSessionWhereUnique
 * @typedef {import('@prisma/client').Prisma.EventSessionSelect} EventSessionSelect
 * @typedef {import('@prisma/client').Prisma.EventSessionInclude} EventSessionInclude
 */

/**
 * @extends {BaseRepository<EventSessionType, EventSessionCreate, EventSessionUpdate, EventSessionWhereUnique, EventSessionSelect, EventSessionInclude, any>}
 */
export default class EventSessionRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, EventSession);
    }

    /**
     * @param {number} eventId
     */
    cancelSessions(eventId, tx = null) {
        return super.updateMany({
            where: { eventId },
            data: { status: SessionStatus.CANCELLED },
        }, tx);
    }

    /**
     * @param {number} eventId
     * @param {any} [tx]
     */
    restoreSessions(eventId, tx = null) {
        return super.updateMany({
            where: { eventId },
            data: { status: SessionStatus.ACTIVE },
        }, tx);
    }
}
