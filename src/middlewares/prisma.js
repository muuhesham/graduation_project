// findUnique doesn't work with the middleware [use soft delete => findFirst works with the middleware]
export function prismaMiddleware(prisma) {
    return prisma.$extends({
        query: {
            $allModels: {
                async findMany({ model, args, query }) {
                    const modelsWithDeletedAt = ['Organizer', 'Event', 'User'];

                    if (modelsWithDeletedAt.includes(model)) {
                        args.where = args.where || {};

                        if (!('deletedAt' in args.where)) {
                            args.where.deletedAt = null;
                        }
                    }

                    return query(args);
                },

                async findFirst({ model, args, query }) {
                    const modelsWithDeletedAt = ['Organizer', 'Event', 'User'];

                    if (modelsWithDeletedAt.includes(model)) {
                        args.where = args.where || {};

                        if (!('deletedAt' in args.where)) {
                            args.where.deletedAt = null;
                        }
                    }

                    return query(args);
                },
            },
        },
    });
}
