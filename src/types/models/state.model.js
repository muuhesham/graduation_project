//@ts-check

/**
 * @typedef {import('@prisma/client').State} StateData
 * @typedef {import('@prisma/client').Prisma.StateCreateInput} StateCreate
 * @typedef {import('@prisma/client').Prisma.StateUpdateInput} StateUpdate
 * @typedef {import('@prisma/client').Prisma.StateWhereUniqueInput} StateWhereUnique
 * @typedef {import('@prisma/client').Prisma.StateWhereInput} StateWhere
 * @typedef {import('@prisma/client').Prisma.StateSelect} StateSelect
 * @typedef {import('@prisma/client').Prisma.StateInclude} StateInclude
 * @typedef {import('@prisma/client').Prisma.StateDefaultArgs} StateDefaultArgs
 * @typedef {import('./../shared/common.types').RepositoryProjection<StateSelect, StateInclude, StateDefaultArgs['omit']>} StateProjection
 * @typedef {import('./../shared/common.types').RepositoryReadOptions<StateWhere, StateSelect, StateInclude, StateDefaultArgs['omit']>} StateReadOptions
 */

/** @typedef {import('@prisma/client').Prisma.StateGetPayload<{ include: { country: true, cities: true, organizers: true } }>} StateWithRelations */
/** @typedef {InstanceType<typeof import('./../../models/State').default>} StateLogic */
/** @typedef {StateWithRelations & StateLogic} State */
/** @typedef {State} StateHydrated */

/**
 * @typedef {object} StateResourceData
 * @property {number} id
 * @property {number} countryId
 * @property {string} name
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {};
