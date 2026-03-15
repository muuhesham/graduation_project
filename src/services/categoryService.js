import { prisma as prismaClient } from '../config/db.js';
import { PrismaQueryBuilder } from '../utils/queryBulider.js';
import fileService from './fileService.js';

const categoryService = {
    ALL_CACHE_PREFIX: 'category:all_categories',
    CACHE_TTL: 60 * 60, // 1 hour

    DEFAULT_SELECTIONS: {
        id: true,
        name: true,
        imageDisk: true,
        imagePath: true,
    },

    DEFAULT_EXCLUDE_FIELDS: {
        id: true,
        updatedAt: true,
        createdAt: true,
    },

    DEFAULT_RELATIONS: {},

    ALLOWED_RELATIONS: ['events'],

    MAX_LIMIT: 10,

    async getByCategory(categoryName, tx = prismaClient) {
        return tx.category.findUnique({
            where: { name: categoryName },
        });
    },

    async getAll({ selections, relations, exclude, limit, page, orderBy, filters } = {}) {
        const query = new PrismaQueryBuilder({
            maxLimit: categoryService.MAX_LIMIT,
            allowedRelations: categoryService.ALLOWED_RELATIONS,
        })
            .paginate(page, limit)
            .sort(orderBy || { createdAt: 'desc' })
            .select(selections || categoryService.DEFAULT_SELECTIONS)
            .include(relations || categoryService.DEFAULT_RELATIONS)
            .omit(exclude || categoryService.DEFAULT_EXCLUDE_FIELDS)
            .where(filters).value;

        const categories = await prismaClient.category.findMany(query);
        return categoryService.getImageAbsUrl(categories);
    },

    findById(id) {
        return prismaClient.category.findUnique({
            where: {
                id,
            },
        });
    },

    getImageAbsUrl(categories) {
        if (!categories) return null;
        if (categories && !Array.isArray(categories)) {
            categories = [categories];
        }

        return categories.map((category) => {
            const { imageDisk, imagePath } = category;

            const absUrl = imagePath ? fileService.getAbsUrl(imagePath, imageDisk) : null;

            const { imageDisk: _, imagePath: __, updatedAt: ___, ...categoryData } = category;

            return {
                ...categoryData,
                imageUrl: absUrl,
            };
        });
    },

    async getPreferences({ userId, tx = prismaClient }) {
        return await tx.category.findMany({
            where: {
                attendees: { some: { attendeeId: userId } },
            },
            select: { id: true, name: true },
        });
    },

    async updatePreferences({ userId, categoryIds }) {
        return await prismaClient.$transaction(async (tx) => {
            await tx.attendeeFavoriteCategory.deleteMany({
                where: { attendeeId: userId },
            });

            await tx.attendeeFavoriteCategory.createMany({
                data: categoryIds.map((id) => ({
                    attendeeId: userId,
                    categoryId: id,
                })),
            });

            return await this.getPreferences({userId, tx});
        });
    },

    async getAllCategories(){
        return await prismaClient.category.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })
    },
    
};

export default categoryService;
