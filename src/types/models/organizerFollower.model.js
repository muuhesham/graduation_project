// @ts-check

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 * @typedef {import('@prisma/client').OrganizerFollower} OrganizerFollowerData
 * @typedef {import('@prisma/client').Prisma.OrganizerFollowerCreateInput} OrganizerFollowerCreate
 * @typedef {import('@prisma/client').Prisma.OrganizerFollowerUpdateInput} OrganizerFollowerUpdate
 * @typedef {import('@prisma/client').Prisma.OrganizerFollowerWhereUniqueInput} OrganizerFollowerWhereUnique
 * @typedef {import('@prisma/client').Prisma.OrganizerFollowerWhereInput} OrganizerFollowerWhere
 * @typedef {import('@prisma/client').Prisma.OrganizerFollowerSelect} OrganizerFollowerSelect
 * @typedef {import('@prisma/client').Prisma.OrganizerFollowerInclude} OrganizerFollowerInclude
 * @typedef {import('@prisma/client').Prisma.OrganizerFollowerDefaultArgs} OrganizerFollowerDefaultArgs
 */

/** @typedef {import('./../shared/common.types').RepositoryProjection<OrganizerFollowerSelect, OrganizerFollowerInclude, OrganizerFollowerDefaultArgs['omit']>} OrganizerFollowerProjection */
/** @typedef {import('./../shared/common.types').RepositoryReadOptions<OrganizerFollowerWhere, OrganizerFollowerSelect, OrganizerFollowerInclude, OrganizerFollowerDefaultArgs['omit']>} OrganizerFollowerReadOptions */

/** @typedef {import('@prisma/client').Prisma.OrganizerFollowerGetPayload<{ include: { user: true, organizer: true } }>} OrganizerFollowerWithRelations */
/** @typedef {OrganizerFollowerWithRelations} OrganizerFollower */

export class IOrganizerFollower {}
