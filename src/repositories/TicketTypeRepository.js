//@ts-check

import BaseRepository from './BaseRepository.js';

import { TicketType } from './../models/index.js';

import OrderStatus from './../constants/enums/orderStatus.js';

/**
 * @typedef {import('./drivers/IDriver').default} IDriver
 * @typedef {import('@prisma/client').Prisma.TicketTypeDefaultArgs} TicketTypeDefaultArgs
 * @typedef {import('./../types/models').TicketType} TicketTypeHydrated
  * @typedef {import('./../types/models').TicketTypeCreate} TicketTypeCreate
  * @typedef {import('./../types/models').TicketTypeUpdate} TicketTypeUpdate
  * @typedef {import('./../types/models').TicketTypeWhereUnique} TicketTypeWhereUnique
  * @typedef {import('@prisma/client').Prisma.TicketTypeSelect} TicketTypeSelect
  * @typedef {import('@prisma/client').Prisma.TicketTypeInclude} TicketTypeInclude
  */

 /**
  * @extends {BaseRepository<TicketTypeHydrated, TicketTypeCreate, TicketTypeUpdate, TicketTypeWhereUnique, TicketTypeSelect, TicketTypeInclude, any>}
  */
 export default class TicketTypeRepository extends BaseRepository {
    /**
     * @param {IDriver} driver
     */
    constructor(driver) {
        super(driver, TicketType);
    }

    /**
     * @param {number} eventId
     */
    ticketSalesByEvent(eventId) {
        return super.findMany({
            where: { eventId },
            select: {
                id: true,
                name: true,
                price: true,
                orderItems: {
                    where: {
                        order: {
                            status: OrderStatus.COMPLETED,
                        },
                    },
                    select: {
                        quantity: true,
                    },
                },
            },
            sort: { field: 'createdAt', order: 'asc' },
        });
    }
}
