//@ts-check

/**
 * @typedef {import('@prisma/client').TicketType} TicketTypeData
 * @typedef {import('@prisma/client').Prisma.TicketTypeCreateInput} TicketTypeCreate
 * @typedef {import('@prisma/client').Prisma.TicketTypeUpdateInput} TicketTypeUpdate
 * @typedef {import('@prisma/client').Prisma.TicketTypeWhereUniqueInput} TicketTypeWhereUnique
 * @typedef {import('@prisma/client').Prisma.TicketTypeWhereInput} TicketTypeWhere
 * @typedef {import('@prisma/client').Prisma.TicketTypeSelect} TicketTypeSelect
 * @typedef {import('@prisma/client').Prisma.TicketTypeInclude} TicketTypeInclude
 * @typedef {import('@prisma/client').Prisma.TicketTypeAggregateArgs} TicketTypeAggregate
 * @typedef {Omit<TicketTypeData, 'price' | 'quantity' | 'sold'> & {
 *   price?: number | null;
 *   quantity?: number | null;
 *   sold?: number | null;
 *   orderItems?: Array<{ quantity?: number | string | null }>;
 * }} TicketTypeHydratedData
 * @typedef {InstanceType<typeof import('./../../models/TicketType.js').default>} TicketTypeModel
 * @typedef {TicketTypeHydratedData & TicketTypeModel} TicketType
 * @typedef {TicketTypeHydratedData & TicketTypeModel} TicketTypeHydrated
 *
 * @typedef {object} TicketTypeSalesResourceData
 * @property {number} ticketTypeId
 * @property {string | null} name
 * @property {number} price
 * @property {number} ticketsSold
 */

export {};
