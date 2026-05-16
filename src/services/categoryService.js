import { prisma as prismaClient } from '../config/db.js';
import { PrismaQueryBuilder } from '../utils/queryBulider.js';
import fileService from './fileService.js';
import { categoryRepository } from '../repositories/index.js';
import ConflictError from '../errors/ConflictError.js';
import CategoryErrors from '../constants/messages/errors/category.js';
import NotFoundError from '../errors/NotFoundError.js';

const categoryService = {
    ALL_CACHE_PREFIX: 'category:all_categories',
    CACHE_TTL: 60 * 60, // 1 hour

    DEFAULT_SELECTIONS: {
        id: true,
        name: true,
        imageDisk: true,
        imagePath: true,
        createdAt: true,
    },

    DEFAULT_EXCLUDE_FIELDS: {
        id: true,
        updatedAt: true,
        createdAt: true,
    },

    DEFAULT_RELATIONS: {},

    ALLOWED_RELATIONS: ['events'],

    MAX_LIMIT: 10,

    /**
     * @deprecated Use repository findUnique instead
     */
    async getByCategory(categoryName, tx = prismaClient) {
        return tx.category.findUnique({
            where: { name: categoryName },
        });
    },

    /**
     * Get all categories using the new repository architecture.
     */
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

        return categoryRepository.findMany(query);
    },

    /**
     * @deprecated Use list with attendee filters instead
     */
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

            return await this.getPreferences({ userId, tx });
        });
    },

    /**
     * @deprecated Use list() instead
     */
    async getAllCategories() {
        return await prismaClient.category.findMany({
            select: { 
                id: true, 
                name: true,
                imagePath: true,
                imageDisk: true,
                createdAt: true,
            },
            orderBy: { name: 'asc' },
        });
    },

    /**
     * @param {import('./../types/shared').RepositoryReadOptions} [options]
     * @returns {Promise<import('../models/Category').default[]>}
     */
    async list(options = {}) {
        return categoryRepository.findMany(options);
    },

    /**
     * @param {object} data
     * @param {string} data.name
     * @param {any} [data.image]
     */
    async createCategory(data) {
        const existing = await categoryRepository.findByName(data.name);
        if (existing) {
            throw new ConflictError(undefined, undefined, [CategoryErrors.CATEGORY_ALREADY_EXISTS]);
        }

        let imageData = { imageDisk: 'local', imagePath: '' };
        if (data.image) {
            const savedFile = await fileService.save(data.image, 'categories');
            if (savedFile) {
                imageData = {
                    imageDisk: savedFile.disk,
                    imagePath: savedFile.path,
                };
            }
        }

        return categoryRepository.create({
            name: data.name,
            ...imageData,
        });
    },

    /**
     * @param {number} id
     * @param {object} data
     * @param {string} [data.name]
     * @param {any} [data.image]
     */
    async updateCategory(id, data) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new NotFoundError(undefined, undefined, [CategoryErrors.CATEGORY_NOT_FOUND]);
        }

        if (data.name && data.name !== category.name) {
            const existing = await categoryRepository.findByName(data.name);
            if (existing) {
                throw new ConflictError(undefined, undefined, [
                    CategoryErrors.CATEGORY_ALREADY_EXISTS,
                ]);
            }
        }

        let imageData = {};
        if (data.image) {
            if (category.imagePath) {
                await fileService.delete(category.imagePath, category.imageDisk);
            }

            const savedFile = await fileService.save(data.image, 'categories');
            if (savedFile) {
                imageData = {
                    imageDisk: savedFile.disk,
                    imagePath: savedFile.path,
                };
            }
        }

        return categoryRepository.update({
            where: { id },
            data: {
                ...(data.name ? { name: data.name } : {}),
                ...imageData,
            },
        });
    },

    /**
     * @param {number} id
     */
    async deleteCategory(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new NotFoundError(undefined, undefined, [CategoryErrors.CATEGORY_NOT_FOUND]);
        }

        return categoryRepository.delete({ where: { id } });
    },
};

export default categoryService;
