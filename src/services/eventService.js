import { prisma as prismaClient } from '../config/db.js';
import slugify from 'slugify';
import ConflictError from '../errors/ConflictError.js';
import { PrismaQueryBuilder } from '../utils/queryBulider.js';
import fileService from './fileService.js';
import venueService from './venueService.js';
import ticketTypeService from './ticketTypeService.js';

const eventService = {
    DEFAULT_MEDIA_FOLDER: 'events',

    DEFAULT_EXCLUDE_FIELDS: {
        id: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        venueId: true,
    },

    DEFAULT_SELECTIONS: {
        id: true,
        organizerId: true,
        title: true,
        slug: true,
        description: true,
        type: true,
        mode: true,
        bannerDisk: true,
        bannerPath: true,
        venueId: true,
        categoryId: true,
        createdAt: true,
    },

    DEFAULT_RELATIONS: {
        venue: true,
        ticketTypes: true,
    },

    ALLOWED_RELATIONS: ['venue', 'category', 'organizer', 'eventSessions', 'ticketTypes'],

    MAX_LIMIT: 100,

    async create(
        organizerId,
        { title, description, type, mode, banner, venueId, categoryId },
        tx = prismaClient,
        { selections, relations, exclude } = {}
    ) {
        const slug = eventService.generateSlug({ title });

        const existingEvent = await eventService.exists(organizerId, slug);
        if (existingEvent) {
            throw new ConflictError('Event with the same title already exists');
        }

        const {
            disk: bannerDisk,
            url: bannerPath,
            absUrl,
        } = await eventService.handleBanner(banner, slug);

        const query = new PrismaQueryBuilder({
            allowedRelations: eventService.ALLOWED_RELATIONS,
        })
            .select(selections || eventService.DEFAULT_SELECTIONS)
            .include(relations || eventService.DEFAULT_RELATIONS)
            .omit(exclude || eventService.DEFAULT_EXCLUDE_FIELDS).value;
        const event = await tx.event.create({
            data: {
                organizerId,
                title,
                slug,
                description,
                bannerDisk,
                bannerPath,
                mode,
                type,
                venueId,
                categoryId,
            },
            ...query,
        });

        if (relations?.ticketTypes) {
            event.ticketTypes.map(
                (ticketType) => (ticketType.price = parseFloat(ticketType.price))
            );
        }
        const { bannerDisk: _, bannerPath: __, ...eventData } = event;

        return {
            ...eventData,
            bannerUrl: absUrl,
        };
    },

    //DELETE
    async delete(eventId) {
        return prismaClient.event.delete({
            where: { id: Number(eventId) },
        });
    },

    //SOFT DELETE
    async softDelete(eventId) {
        return prismaClient.event.update({
            where: { id: Number(eventId) },
            data: { deletedAt: new Date() },
        });
    },

    //UPDATE
    async update(
        eventId,
        organizerId,
        { title, description, banner, mode, type, categoryId, venueId },
        tx = prismaClient
    ) {
        const slug = eventService.generateSlug({ title });

        const existingEvent = await eventService.findBySlug(organizerId, slug);
        if (existingEvent) {
            throw new ConflictError('Event with the same title already exists');
        }

        let newBannerPath = null;
        let newBannerDisk = null;
        let newAbsUrl = null;
        if (banner) {
            const {
                disk: bannerDisk,
                url: bannerPath,
                absUrl,
            } = await eventService.handleBanner(banner);
            newBannerPath = bannerPath;
            newBannerDisk = bannerDisk;
            newAbsUrl = absUrl;
        }

        const updatedEvent = await tx.event.update({
            where: { id: eventId },
            data: {
                title,
                slug,
                description,
                mode,
                type,
                categoryId,
                venueId,
                ...(newBannerDisk && { bannerDisk: newBannerDisk }),
                ...(newBannerPath && { bannerPath: newBannerPath }),
            },
        });

        const { bannerDisk, bannerPath, ...updatedEventData } = updatedEvent;

        return {
            ...updatedEventData,
            bannerUrl: newAbsUrl || eventService.getBannerAbsUrl(updatedEvent)[0].bannerUrl,
        };
    },

    async deleteSessions(eventId, tx = prismaClient) {
        return tx.eventSession.deleteMany({
            where: { eventId },
        });
    },

    async createBulkSessions(eventId, sessions, tx = prismaClient) {
        const sessionsData = sessions.map((session) => ({
            eventId,
            startDate: session.startDate,
            endDate: session.endDate,
        }));

        return tx.eventSession.createManyAndReturn({
            data: sessionsData,
        });
    },

    async handleBanner(banner, relPath = null) {
        if (!banner) return { disk: null, url: null, absUrl: null };

        const folder = relPath
            ? `${eventService.DEFAULT_MEDIA_FOLDER}/${relPath}`
            : eventService.DEFAULT_MEDIA_FOLDER;
        return await fileService.save(banner, folder);
    },

    async findBySlug(organizerId, slug, { selections, relations, filters, exclude } = {}) {
        const query = new PrismaQueryBuilder({
            maxLimit: eventService.MAX_LIMIT,
            allowedRelations: eventService.ALLOWED_RELATIONS,
        })
            .select(selections || eventService.DEFAULT_SELECTIONS)
            .include(relations || eventService.DEFAULT_RELATIONS)
            .where(filters)
            .omit(exclude).value;

        const event = await prismaClient.event.findFirst({
            where: { organizerId, slug },
            ...query,
        });

        if (relations?.ticketTypes) {
            event.ticketTypes.map(
                (ticketType) => (ticketType.price = parseFloat(ticketType.price))
            );
        }

        return eventService.getBannerAbsUrl(event);
    },

    async getAll({ selections, relations, page, limit, orderBy, filters, exclude } = {}) {
        const query = new PrismaQueryBuilder({
            maxLimit: eventService.MAX_LIMIT,
            allowedRelations: eventService.ALLOWED_RELATIONS,
        })
            .paginate(page, limit)
            .sort(orderBy || { createdAt: 'desc' })
            .select(selections || eventService.DEFAULT_SELECTIONS)
            .include(relations || eventService.DEFAULT_RELATIONS)
            .omit(exclude || eventService.DEFAULT_EXCLUDE_FIELDS)
            .where(filters).value;

        const events = await prismaClient.event.findMany(query);

        if (relations?.ticketTypes) {
            events.map((event) => {
                event.ticketTypes.map((ticketType) => {
                    ticketType.price = parseFloat(ticketType.price);
                });
            });
        }
        return eventService.getBannerAbsUrl(events);
    },

    async getById(id, { selections, relations, filters, exclude } = {}) {
        const query = new PrismaQueryBuilder({
            allowedRelations: eventService.ALLOWED_RELATIONS,
        })
            .select(selections || eventService.DEFAULT_SELECTIONS)
            .include(relations || eventService.DEFAULT_RELATIONS)
            .omit(exclude || eventService.DEFAULT_EXCLUDE_FIELDS)
            .where(filters).value;

        const event = await prismaClient.event.findUnique({
            where: { id },
            ...query,
        });

        if (event) {
            const [eventWithBannerUrl] = eventService.getBannerAbsUrl(event);
            return eventWithBannerUrl;
        }
        return null;
    },

    async getLatest({ selections, relations, orderBy, filters, exclude, limit, page } = {}) {
        const query = new PrismaQueryBuilder({
            maxLimit: eventService.MAX_LIMIT,
            allowedRelations: eventService.ALLOWED_RELATIONS,
        })
            .paginate(page, limit || 5)
            .sort({ createdAt: orderBy || 'desc' })
            .select(selections || eventService.DEFAULT_SELECTIONS)
            .include(relations || eventService.DEFAULT_RELATIONS)
            .where(filters)
            .omit(exclude || eventService.DEFAULT_EXCLUDE_FIELDS).value;

        const events = await prismaClient.event.findMany(query);
        if (relations?.ticketTypes) {
            events.map((event) => {
                event.ticketTypes.map((ticketType) => {
                    ticketType.price = parseFloat(ticketType.price);
                });
            });
        }
        return eventService.getBannerAbsUrl(events);
    },

    async getBySessionBetween(
        startDate,
        endDate,
        { selections, relations, orderBy, filters, exclude, limit, page } = {}
    ) {
        const query = new PrismaQueryBuilder({
            maxLimit: eventService.MAX_LIMIT,
            allowedRelations: eventService.ALLOWED_RELATIONS,
        })
            .select(selections || eventService.DEFAULT_SELECTIONS)
            .include(relations || eventService.DEFAULT_RELATIONS)
            .omit(exclude || eventService.DEFAULT_EXCLUDE_FIELDS)
            .paginate(page, limit)
            .where({
                eventSessions: {
                    some: {
                        startDate: { lte: new Date(endDate) },
                        endDate: { gte: new Date(startDate) },
                    },
                },
                ...filters,
            })
            .sort(orderBy).value;

        const events = await prismaClient.event.findMany(query);
        if (relations?.ticketTypes) {
            events.map((event) => {
                event.ticketTypes.map((ticketType) => {
                    ticketType.price = parseFloat(ticketType.price);
                });
            });
        }
        return eventService.getBannerAbsUrl(events);
    },

    async getCreatedBetween(
        startDate,
        endDate,
        { selections, relations, orderBy, filters, exclude, page, limit } = {}
    ) {
        const query = new PrismaQueryBuilder({
            maxLimit: eventService.MAX_LIMIT,
            allowedRelations: eventService.ALLOWED_RELATIONS,
        })
            .select(selections || eventService.DEFAULT_SELECTIONS)
            .include(relations || eventService.DEFAULT_RELATIONS)
            .omit(exclude || eventService.DEFAULT_EXCLUDE_FIELDS)
            .paginate(page, limit)
            .where({
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
                ...filters,
            })
            .sort(orderBy).value;

        const events = await prismaClient.event.findMany(query);
        if (relations?.ticketTypes) {
            events.map((event) => {
                event.ticketTypes.map((ticketType) => {
                    ticketType.price = parseFloat(ticketType.price);
                });
            });
        }
        return eventService.getBannerAbsUrl(events);
    },

    async exists(organizerId, slug) {
        return prismaClient.event.findFirst({
            where: {
                organizerId,
                slug,
            },
        });
    },

    getBannerAbsUrl(events) {
        if (!events) return null;
        if (events && !Array.isArray(events)) {
            events = [events];
        }
        return events.map((event) => {
            const { bannerDisk, bannerPath } = event;

            const absUrl = bannerPath ? fileService.getAbsUrl(bannerPath, bannerDisk) : null;

            const { bannerDisk: _, bannerPath: __, updatedAt: ___, ...eventData } = event;

            return {
                ...eventData,
                bannerUrl: absUrl,
            };
        });
    },

    generateSlug({ title }) {
        return slugify(title, { lower: true, strict: true });
    },

    async show(organizerId, slug) {
        const relations = {
            venue: {
                omit: venueService.DEFAULT_EXCLUDE_FIELDS,
            },
            ticketTypes: {
                omit: ticketTypeService.DEFAULT_EXCLUDE_FIELDS,
            },
        };

        return await eventService.findBySlug(organizerId, slug, { relations });
    },
};

export default eventService;
