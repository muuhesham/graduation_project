import { prisma as prismaClient } from '../config/db.js';
import slugify from 'slugify';
import { Event } from '../models/index.js';
import ConflictError from '../errors/ConflictError.js';
import { PrismaQueryBuilder } from '../utils/queryBulider.js';
import fileService from './fileService.js';
import venueService from './venueService.js';
import orderService from './orderService.js';
import NotFoundError from '../errors/NotFoundError.js';
import paymentService from './paymentService.js';
import OrderStatus from '../constants/enums/orderStatus.js';
import ticketTypeService from './ticketTypeService.js';
import { redis } from '../config/redis.js';
import AppError from '../errors/AppError.js';
import { buildPagination } from '../utils/pagination.js';
import {
    eventRepository,
    tagRepository,
    eventTagRepository,
    eventSessionRepository,
    eventRuleRepository,
} from './../repositories/index.js';
import EventErrors from './../constants/messages/errors/event.js';
import { addEmbeddingJob, EmbeddingJobType } from '../queues/embeddingQueue.js';

/**
 * @typedef {import('@prisma/client').Prisma} PrismaClient
 * @typedef {import('./../types/shared').TransactionClient} TransactionClient
 * @typedef {import('./../types/shared').PaginationQuery} PaginationQuery
 * @typedef {import('@prisma/client').Prisma.EventDefaultArgs} EventDefaultArgs
 * @typedef {import('./../types/models').Event} EventModel
 * @typedef {import('./../types/models').EventHydrated} EventHydrated
 * @typedef {import('./../types/models').EventWhere} EventWhere
 * @typedef {import('./../types/models').EventCreate} EventCreate
 * @typedef {import('./../types/models').EventUpdate} EventUpdate
 * @typedef {import('./../types/shared').RepositoryReadOptions<EventWhere, EventDefaultArgs['select'], EventDefaultArgs['include'], EventDefaultArgs['omit']>} EventListOptions
 */

const SEARCH_STOP_WORDS = new Set([
    'a',
    'an',
    'and',
    'are',
    'at',
    'be',
    'for',
    'from',
    'i',
    'in',
    'is',
    'it',
    'me',
    'my',
    'of',
    'on',
    'or',
    'our',
    'the',
    'to',
    'we',
    'where',
    'with',
    'you',
    'your',
]);

const KEYWORD_SEARCH_PATHS = [
    ['title'],
    ['description'],
    ['venue', 'is', 'name'],
    ['venue', 'is', 'city'],
    ['category', 'is', 'name'],
    ['eventTags', 'some', 'tag', 'name'],
];

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
        eventSessions: true,
        categoryId: true,
        createdAt: true,
        hasSeatMap: true,
    },

    DEFAULT_RELATIONS: {
        venue: true,
        category: true,
        ticketTypes: true,
        eventSessions: true,
        eventSeatTier: true,
        eventSeat: true,
        eventRules: {
            select: { rule: true },
        },
        eventTags: {
            include: { tag: { select: { name: true } } },
        },
        interestedEvents: true,
    },

    ALLOWED_RELATIONS: [
        'venue',
        'category',
        'organizer',
        'eventSessions',
        'ticketTypes',
        'eventSeatTier',
        'eventSeat',
        'eventTags',
        'eventRules',
        'interestedEvents',
    ],

    MAX_LIMIT: 100,
    RESERVATION_TTL_SECONDS: 10 * 60,

    /**
     * Map request data to database-safe fields.
     * @private
     * @param {object} data
     * @returns {object}
     */
    _mapToDbFields(data) {
        const updateData = {};
        const dbFields = [
            'title',
            'description',
            'type',
            'mode',
            'venueId',
            'categoryId',
            'hasSeatMap',
        ];

        for (const field of dbFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        if (data.eventType !== undefined) {
            updateData.hasSeatMap = data.eventType === 'seatmap';
        }

        return updateData;
    },

    async create(
        organizerId,
        { title, description, type, mode, banner, venueId, categoryId, eventType },
        tx = prismaClient,
        { selections, relations, exclude } = {}
    ) {
        const slug = eventService.generateSlug({ title });

        const existingEvent = await eventService.exists(organizerId, slug, tx);
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
                hasSeatMap: eventType === 'seatmap',
            },
            ...query,
        });

        if (relations?.ticketTypes) {
            event.ticketTypes.map(
                (ticketType) => (ticketType.price = parseFloat(ticketType.price))
            );
        }
        const { bannerDisk: _, bannerPath: __, ...eventData } = event;

        await addEmbeddingJob(EmbeddingJobType.GENERATE_EMBEDDING, String(event.id)).catch(
            (err) => {
                console.error(`Failed to queue embedding generation for event ${event.id}:`, err);
            }
        );

        return {
            ...eventData,
            bannerUrl: absUrl,
        };
    },

    /**
     * @param {string} slug
     * @param {any} banner
     * @returns {Promise<{ disk: string | null, url: string | null }>}
     */
    async saveBannerAsset(slug, banner) {
        if (!banner) {
            return { disk: null, url: null };
        }

        const folder = Event.getUploadPath(slug);
        const savedBanner = await fileService.save(banner, folder);

        return {
            disk: savedBanner?.disk ?? null,
            url: savedBanner?.url ?? null,
        };
    },

    /**
     * @param {string} organizerId
     * @param {EventCreate & { banner?: any, eventType?: string }} data
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<EventModel>}
     */
    async createRecord(organizerId, data, tx = null) {
        const slug = this.generateSlug({ title: data.title });

        const existingEvent = await this.exists(organizerId, slug, tx);
        if (existingEvent) {
            throw new ConflictError(undefined, undefined, [EventErrors.EVENT_ALREADY_EXISTS]);
        }

        const { disk: bannerDisk, url: bannerPath } = await this.saveBannerAsset(slug, data.banner);

        const createData = {
            ...this._mapToDbFields(data),
            organizerId,
            slug,
            bannerDisk,
            bannerPath,
        };

        return eventRepository.create(createData, tx);
    },

    /**
     * @param {number} id
     * @param {string} organizerId
     * @param {EventUpdate & { banner?: any, eventType?: string }} data
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<EventModel>}
     */
    async updateRecord(id, organizerId, data, tx = null) {
        const slug = this.generateSlug({ title: data.title });

        const existingEvent = await eventRepository.findBySlug(organizerId, slug, {}, tx);
        if (existingEvent && existingEvent.id !== id) {
            throw new ConflictError(undefined, undefined, [EventErrors.EVENT_ALREADY_EXISTS]);
        }

        const updateData = this._mapToDbFields(data);

        if (data.banner) {
            const currentEvent = await eventRepository.findById(id, { select: { slug: true } }, tx);
            const bannerSlug = slug || currentEvent?.slug || '';
            const { disk: bannerDisk, url: bannerPath } = await this.saveBannerAsset(
                bannerSlug,
                data.banner
            );
            Object.assign(updateData, { bannerDisk, bannerPath });
        }

        if (slug) updateData.slug = slug;

        return eventRepository.update(
            {
                where: { id },
                data: updateData,
            },
            tx
        );
    },

    /**
     * @param {number} id
     * @param {object} [options]
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<EventModel | null>}
     */
    async findByIdIncludingDeleted(id, options = {}, tx = null) {
        return eventRepository.findByIdIncludingDeleted(id, options, tx);
    },

    /**
     * @param {number} eventId
     * @returns {Promise<EventModel | null>}
     */
    async delete(eventId) {
        return this.softDelete(eventId);
    },

    /**
     * @param {number} eventId
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<EventModel | null>}
     */
    async softDelete(eventId, tx = null) {
        const event = await eventRepository.findById(eventId, {}, tx);

        if (!event) {
            throw new NotFoundError(undefined, undefined, [EventErrors.EVENT_NOT_FOUND]);
        }

        if (!event.canBeDeleted()) {
            throw new ConflictError(undefined, undefined, [EventErrors.EVENT_CANNOT_BE_DELETED]);
        }

        return eventRepository.softDeleteById(eventId, tx);
    },

    async update(
        eventId,
        organizerId,
        { title, description, banner, mode, type, categoryId, venueId },
        tx = prismaClient
    ) {
        let slug = undefined;
        if (title) {
            const slug = eventService.generateSlug({ title });

            const existingEvent = await eventService.findBySlug(organizerId, slug);
            if (existingEvent) {
                throw new ConflictError('Event with the same title already exists');
            }
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
            include: {
                eventRules: {
                    select: { rule: true },
                },
                eventTags: {
                    include: { tag: { select: { name: true } } },
                },
            },
        });

        const { bannerDisk, bannerPath, eventRules, eventTags, ...updatedEventData } = updatedEvent;

        const formattedRules = eventRules?.map((rule) => rule.rule) || [];
        const formattedTags = eventTags?.map((tag) => tag.tag.name) || [];
        updatedEventData.tags = formattedTags;
        updatedEventData.rules = formattedRules;

        await addEmbeddingJob(EmbeddingJobType.UPDATE_EMBEDDING, String(eventId)).catch((err) => {
            console.error(`Failed to queue embedding update for event ${eventId}:`, err);
        });

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

    /**
     * @param {number} eventId
     * @param {TransactionClient | null} [tx]
     */
    async deleteSessionsRecord(eventId, tx = null) {
        return eventSessionRepository.deleteMany(
            {
                where: { eventId },
            },
            tx
        );
    },

    async createBulkSessions(eventId, sessions, tx = prismaClient) {
        const sessionsData = sessions.map((session) => ({
            eventId,
            startDate: session.startDate,
            endDate: session.endDate,
        }));
        const result = await tx.eventSession.createMany({
            data: sessionsData,
        });
        return result;
    },

    /**
     * @param {number} eventId
     * @param {{ startDate: Date | string, endDate: Date | string }[]} sessions
     * @param {TransactionClient | null} [tx]
     */
    async createSessionsRecord(eventId, sessions, tx = null) {
        const sessionsData = sessions.map((session) => ({
            eventId,
            startDate: session.startDate,
            endDate: session.endDate,
        }));
        return eventSessionRepository.bulkInsert(
            {
                data: sessionsData,
            },
            tx
        );
    },

    async ticketsSoldByEvent(eventId) {
        return orderService.ticketsSoldByEvent(eventId);
    },

    async revenueByEvent(eventId) {
        return orderService.revenueByEvent(eventId);
    },

    async countAllEvents() {
        return eventRepository.countAllEvents();
    },

    async countEventOrdersByStatus(eventId, status) {
        return orderService.countByEventAndStatus(eventId, status);
    },

    async countIssuedTickets(eventId) {
        return orderService.countIssuedTicketsByEvent(eventId);
    },

    async countActiveSeatReservations(eventId) {
        try {
            const keys = await redis.keys(`reservation:event:${eventId}:seat:*`);
            return keys.length;
        } catch (error) {
            return null;
        }
    },

    /**
     * @param {number} id
     */
    async restoreDeleted(id) {
        const event = await eventRepository.findByIdIncludingDeleted(id);
        if (!event) {
            throw new NotFoundError(undefined, undefined, [
                {
                    message: EventErrors.EVENT_NOT_FOUND.message,
                    code: EventErrors.EVENT_NOT_FOUND.code,
                },
            ]);
        }
        return eventRepository.restoreDeleted(id);
    },

    /**
     * @param {EventListOptions} [options]
     */
    list(options = { page: 1, limit: 10 }) {
        return eventRepository.paginate(options);
    },

    // /**
    //  * @param {EventModel | null | undefined} event
    //  * @returns {EventModel | null | undefined}
    //  */
    // attachBannerUrl(event) {
    //     if (!event) return event;

    //     event.bannerUrl =
    //         event.bannerPath && event.bannerDisk
    //             ? fileService.getAbsUrl(event.bannerPath, event.bannerDisk)
    //             : null;

    //     return event;
    // },

    /**
     * @deprecated Use Event model's bannerUrl getter.
     */
    attachBannerUrls(events = []) {
        return events.map((event) => this.attachBannerUrl(event)).filter(Boolean);
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

        if (!event) {
            return null;
        }

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

        // if (query.select && query.select.interestedEvents) {
        //     query.select.interestedEvents = {
        //         where: {
        //             userId: userId || ' ',
        //         },
        //     };
        // }

        const events = await prismaClient.event.findMany(query);

        if (relations?.ticketTypes) {
            events.map((event) => {
                event.ticketTypes.map((ticketType) => {
                    ticketType.price = parseFloat(ticketType.price);
                });
            });
        }
        if (relations?.eventSessions) {
            events.map((event) => {
                event.eventSessions.map((session) => {});
            });
        }

        events.forEach((event) => {
            event.isInterested = false;
            delete event.interestedEvents;
        });

        return eventService.getBannerAbsUrl(events);
    },

    /**
     * @deprecated - use findById with appropriate projection instead
     */
    async getById(id, { selections, relations, filters, exclude } = {}) {
        const query = new PrismaQueryBuilder({
            allowedRelations: eventService.ALLOWED_RELATIONS,
        })
            .select(selections || eventService.DEFAULT_SELECTIONS)
            .include(relations || eventService.DEFAULT_RELATIONS)
            .omit(exclude || eventService.DEFAULT_EXCLUDE_FIELDS)
            .where(filters).value;

        const event = await prismaClient.event.findFirst({
            where: { id },
            ...query,
        });

        if (event) {
            const [eventWithBannerUrl] = eventService.getBannerAbsUrl(event);
            return eventWithBannerUrl;
        }
        return null;
    },

    async getLatest({
        selections,
        relations,
        orderBy,
        filters,
        exclude,
        limit,
        page,
        userId,
    } = {}) {
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

        if (query.select && query.select.interestedEvents) {
            query.select.interestedEvents = {
                where: {
                    userId: userId || ' ',
                },
            };
        }

        const events = await prismaClient.event.findMany(query);
        if (relations?.ticketTypes) {
            events.map((event) => {
                event.ticketTypes.map((ticketType) => {
                    ticketType.price = parseFloat(ticketType.price);
                });
            });
        }

        events.forEach((event) => {
            event.isInterested = !!(event.interestedEvents && event.interestedEvents.length > 0);
            event.interestedCount = event.interestedEvents ? event.interestedEvents.length : 0;
            delete event.interestedEvents;
        });

        return eventService.getBannerAbsUrl(events);
    },

    async getBySessionBetween(
        startDate,
        endDate,
        { selections, relations, orderBy, filters, exclude, limit, page, userId } = {}
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

        if (query.include.interestedEvents) {
            query.include.interestedEvents = {
                where: {
                    userId: userId || -1,
                },
            };
        }

        const events = await prismaClient.event.findMany(query);
        if (relations?.ticketTypes) {
            events.map((event) => {
                event.ticketTypes.map((ticketType) => {
                    ticketType.price = parseFloat(ticketType.price);
                });
            });
        }

        events.forEach((event) => {
            event.isInterested = !!(event.interestedEvents && event.interestedEvents.length > 0);
            event.interestedCount = event.interestedEvents ? event.interestedEvents.length : 0;
            delete event.interestedEvents;
        });

        return eventService.getBannerAbsUrl(events);
    },

    async getCreatedBetween(
        startDate,
        endDate,
        { selections, relations, orderBy, filters, exclude, page, limit, userId } = {}
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

        if (query.select.interestedEvents) {
            query.select.interestedEvents = {
                where: { userId: userId || ' ' },
            };
        }

        const events = await prismaClient.event.findMany(query);
        if (relations?.ticketTypes) {
            events.map((event) => {
                event.ticketTypes.map((ticketType) => {
                    ticketType.price = parseFloat(ticketType.price);
                });
            });
        }
        events.forEach((event) => {
            event.isInterested = !!(event.interestedEvents && event.interestedEvents.length > 0);
            event.interestedCount = event.interestedEvents ? event.interestedEvents.length : 0;
            delete event.interestedEvents;
        });

        return eventService.getBannerAbsUrl(events);
    },

    /**
     * @deprecated Use existsById instead
     */
    async exists(organizerId, slug, tx = prismaClient) {
        return tx.event.findFirst({
            where: {
                organizerId,
                slug,
            },
        });
    },

    /**
     * @param {number} organizerId
     * @param {string} slug
     * @param {object} [projection]
     * @param {TransactionClient | null} [tx]
     * @return {Promise<EventModel | null>}
     */
    async existsById(organizerId, slug, projection = {}, tx = null) {
        return !!(await eventRepository.findBySlug(organizerId, slug, {}, tx));
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

    async show(id) {
        const relations = {
            venue: {
                omit: venueService.DEFAULT_EXCLUDE_FIELDS,
            },
            ticketTypes: {
                omit: ticketTypeService.DEFAULT_EXCLUDE_FIELDS,
            },

            eventSessions: {
                omit: {
                    eventId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },

            eventSeatTier: {
                omit: {
                    id: true,
                    eventId: true,
                },
            },
            eventSeat: {
                omit: {
                    id: true,
                    eventId: true,
                },
            },
            eventRules: {
                select: { rule: true },
            },
            eventTags: {
                select: { tag: { select: { name: true } } },
            },
        };

        const event = await eventService.getById(id, { relations });
        if (!event) {
            return {
                status: 'fail',
                statusCode: 404,
                data: { message: 'Event not found' },
            };
        }
        const { eventRules, eventTags, ...eventData } = event;

        return {
            ...eventData,
            rules: eventRules?.map((r) => r.rule) || [],
            tags: eventTags?.map((t) => t.tag.name) || [],
        };
    },

    /**
     * @param {number} id
     * @param {object} [options]
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<EventModel | null>}
     */
    findById(id, options = {}, tx = null) {
        if (!options.include && !options.select) {
            options.include = this.DEFAULT_RELATIONS;
        }
        return eventRepository.findById(id, options, tx);
    },

    async availability(eventId) {
        const event = await eventService.getById(eventId, {
            relations: {
                eventSeat: {
                    select: {
                        rowIndex: true,
                        seatIndex: true,
                        isSold: true,
                    },
                },
            },
        });

        if (!event) {
            return {
                status: 'fail',
                statusCode: 404,
                data: { message: 'Event not found' },
            };
        }

        if (!event.hasSeatMap) {
            return {
                status: 'fail',
                statusCode: 400,
                data: { message: 'Event does not support seat map' },
            };
        }
        const reservedSeats = await redis.keys(`reservation:event:${eventId}:seat:*`);
        const reservedSeatSet = new Set(reservedSeats.map((key) => key.split(':').slice(-1)[0]));
        const seats = event.eventSeat.map((seat) => {
            const key = `${seat.rowIndex}-${seat.seatIndex}`;
            if (seat.isSold) {
                return {
                    row: seat.rowIndex,
                    number: seat.seatIndex,
                    status: 'sold',
                };
            }
            if (reservedSeatSet.has(key)) {
                return {
                    row: seat.rowIndex,
                    number: seat.seatIndex,
                    status: 'reserved',
                };
            }
            return {
                row: seat.rowIndex,
                number: seat.seatIndex,
                status: 'available',
            };
        });
        return {
            eventId,
            seats,
        };
    },

    async findSessionById(sessionId, { selections, relations, filters, exclude } = {}) {
        const query = new PrismaQueryBuilder({
            maxLimit: eventService.MAX_LIMIT,
        })
            .select(selections)
            .include(relations)
            .omit(exclude)
            .where(filters).value;

        return prismaClient.eventSession.findUnique({
            where: { id: sessionId },
            ...query,
        });
    },

    async isOrganizer(id, userId) {
        const event = await this.getById(id, {
            relations: {
                organizer: {
                    select: { userId: true, id: true },
                },
            },
        });

        if (!event) throw new NotFoundError('Event not found');

        if (!event.organizer) return false;

        return event.organizer.userId === userId;
    },

    async validateAndFetchTickets(id, requestedTickets, userId) {
        const event = await eventService.getById(id, {
            relations: {
                ticketTypes: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        sold: true,
                        quantity: true,
                    },
                },
                organizer: {
                    select: {
                        id: true,
                        userId: true,
                    },
                },
                eventSeatTier: {
                    select: {
                        tierNumber: true,
                        price: true,
                        name: true,
                    },
                },
                eventSeat: {
                    select: {
                        rowIndex: true,
                        seatIndex: true,
                        tierNumber: true,
                    },
                },
            },
        });
        if (!event) throw new NotFoundError('Event not found');
        if (event.hasSeatMap) {
            const seatMap = new Map(
                event.eventSeat.map((seat) => [`${seat.rowIndex}-${seat.seatIndex}`, seat])
            );

            const tierMap = new Map(event.eventSeatTier.map((tier) => [tier.tierNumber, tier]));

            const verifiedItems = [];
            const lineItems = [];
            let totalPrice = 0;
            let itemsCount = 0;

            const usedSeats = new Set();

            requestedTickets.forEach((ticket, index) => {
                if (!ticket.seatInfo) {
                    throw new AppError(`Seats Info for ticket ${index + 1} can't be empty`);
                }
            });

            for (const reqTicket of requestedTickets) {
                const { row, number, tierId, tierName } = reqTicket.seatInfo;

                const key = `${row}-${number}`;

                if (usedSeats.has(key)) {
                    throw new ConflictError('Duplicate seat selection');
                }
                usedSeats.add(key);

                const dbSeat = seatMap.get(key);
                if (!dbSeat) {
                    throw new NotFoundError('Seat does not exist');
                }

                if (dbSeat.isSold) {
                    throw new ConflictError('Seat already sold');
                }

                if (dbSeat.tierNumber !== Number(tierId)) {
                    throw new ConflictError('Seat tier mismatch');
                }

                const dbTier = tierMap.get(Number(tierId));
                if (!dbTier) {
                    throw new NotFoundError('Tier not found');
                }

                const reservationKey = `reservation:event:${id}:seat:${key}`;
                const reservation = await redis.get(reservationKey);
                if (reservation) {
                    const reservationData = JSON.parse(reservation);
                    if (reservationData.userId !== userId) {
                        throw new ConflictError('Seat already reserved by another user');
                    }
                } else {
                    throw new ConflictError(
                        'Seat not reserved, please reserve the seat before checkout'
                    );
                }
                const price = event.type === 'free' ? 0 : parseFloat(dbTier.price);

                totalPrice += price;
                itemsCount += 1;

                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Row ${String.fromCharCode(65 + row)}, Seat ${number + 1}`,
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: 1,
                });

                verifiedItems.push({
                    eventId: event.id,
                    rowIndex: row,
                    seatIndex: number,
                    tierNumber: Number(tierId),
                    price,
                    ticketTypeId: Number(
                        event.ticketTypes.find((tier) => tier.name === tierName)?.id
                    ),
                    name: tierName,
                    quantity: 1,
                });
            }

            return { event, verifiedItems, totalPrice, itemsCount, lineItems };
        }
        const dbTicketMap = new Map(event.ticketTypes.map((t) => [t.name, t]));
        const verifiedItems = [];
        const lineItems = [];
        let totalPrice = 0;
        let itemsCount = 0;

        for (const reqTicket of requestedTickets) {
            const dbTicket = dbTicketMap.get(reqTicket.name);

            if (!dbTicket) throw new NotFoundError(`Ticket ${reqTicket.name} invalid`);

            if (dbTicket.quantity - dbTicket.sold < reqTicket.quantity) {
                throw new ConflictError(`Not enough stock for ${reqTicket.name}`);
            }

            if (reqTicket.quantity <= 0) {
                throw new ConflictError(`Invalid quantity for ${reqTicket.name}`);
            }

            totalPrice += parseFloat(dbTicket.price) * reqTicket.quantity;
            itemsCount += reqTicket.quantity;

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: dbTicket.name },
                    unit_amount: Math.round(parseFloat(dbTicket.price) * 100),
                },
                quantity: reqTicket.quantity,
            });

            verifiedItems.push({
                ticketTypeId: dbTicket.id,
                price: dbTicket.price,
                name: dbTicket.name,
                quantity: reqTicket.quantity,
            });
        }

        return { event, verifiedItems, totalPrice, itemsCount, lineItems };
    },

    async checkout(id, userId, userEmail, tickets) {
        const { event, verifiedItems, totalPrice, itemsCount, lineItems } =
            await eventService.validateAndFetchTickets(id, tickets, userId);
        if (event.organizer.userId === userId) {
            throw new ConflictError('Organizers cannot purchase tickets for their own events');
        }

        const { order, session } = await prismaClient.$transaction(
            async (tx) => {
                const order = await orderService.create(
                    userId,
                    totalPrice,
                    itemsCount,
                    parseInt(totalPrice) === 0 ? OrderStatus.COMPLETED : OrderStatus.PENDING,
                    {
                        selections: {
                            id: true,
                        },
                        exclude: {
                            updatedAt: true,
                            userId: true,
                        },
                        relations: {},
                        filter: {},
                    },
                    tx
                );

                const orderItems = await orderService.createOrderItemsBulk(
                    order.id,
                    verifiedItems,
                    tx
                );
                let session;
                if (totalPrice === 0) {
                    await ticketTypeService.issueTicketsForOrder(
                        order.id,
                        userId,
                        orderItems,
                        verifiedItems,
                        tx
                    );
                } else {
                    session = await paymentService.createCheckoutSession(
                        undefined,
                        undefined,
                        lineItems,
                        userEmail,
                        {
                            orderId: order.id,
                            userId,
                            seatMetaData: JSON.stringify(verifiedItems),
                        }
                    );
                }

                return { order, session };
            },
            {
                timeout: 15000, // 15 seconds
            }
        );

        return {
            status: 'success',
            data: {
                orderId: order.id,
                stripeUrl: session?.url,
            },
        };
    },

    async reserve(eventId, userId, tickets, io) {
        const event = await eventService.getById(eventId, {
            relations: {
                eventSeat: {
                    select: {
                        rowIndex: true,
                        seatIndex: true,
                        isSold: true,
                    },
                },
            },
        });

        if (!event) {
            return {
                status: 'fail',
                statusCode: 404,
                data: { message: 'Event not found' },
            };
        }

        if (!event.hasSeatMap) {
            return {
                status: 'fail',
                statusCode: 400,
                data: { message: 'Seat reservation is only supported for seat-map events' },
            };
        }

        const count = await redis.get(`abuse:user:${userId}`);
        if (count && Number(count) >= 3) {
            return {
                status: 'fail',
                statusCode: 403,
                data: {
                    message:
                        'Your banned due to too many unpaid reservations. Please try again later.',
                },
            };
        }

        const seatMap = {};

        for (const seat of event.eventSeat) {
            const key = `${seat.rowIndex}-${seat.seatIndex}`;
            seatMap[key] = seat;
        }

        let seatsRequest = {};
        for (const ticket of tickets) {
            const { row, number } = ticket.seatInfo;
            const key = `${row}-${number}`;
            if (seatsRequest[key]) {
                return {
                    status: 'fail',
                    statusCode: 409,
                    data: {
                        message: `Duplicate seat selection at row ${row} and number ${number}`,
                    },
                };
            }
            seatsRequest[key] = true;
            const dbSeat = seatMap[key];

            if (!dbSeat) {
                return {
                    status: 'fail',
                    statusCode: 404,
                    data: { message: `Seat at row ${row} and number ${number} does not exist` },
                };
            }

            if (dbSeat.isSold) {
                return {
                    status: 'fail',
                    statusCode: 409,
                    data: { message: `Seat at row ${row} and number ${number} is already sold` },
                };
            }
        }

        let reservedSeatsKeys = [];
        try {
            for (const ticket of tickets) {
                const { row, number } = ticket.seatInfo;
                const key = `reservation:event:${eventId}:seat:${row}-${number}`;
                const value = JSON.stringify({
                    userId,
                });
                const status = await redis.set(
                    key,
                    value,
                    'EX',
                    eventService.RESERVATION_TTL_SECONDS,
                    'NX'
                );
                if (!status) {
                    throw new Error(`Seat is already reserved`);
                }
                io.to(`event-${eventId}`).emit('seat:update', {
                    row,
                    number,
                    status: 'reserved',
                });
                reservedSeatsKeys.push(key);
            }

            const userKey = `reservation:event:${eventId}`;
            await redis.set(
                userKey,
                JSON.stringify({
                    userId,
                }),
                'EX',
                eventService.RESERVATION_TTL_SECONDS + 30
            );

            return {
                status: 'success',
                data: {},
            };
        } catch (error) {
            if (reservedSeatsKeys.length > 0) {
                await redis.del(...reservedSeatsKeys);
            }
            if (error.message === 'Seat is already reserved') {
                return {
                    status: 'fail',
                    statusCode: 409,
                    data: { message: error.message },
                };
            }
            return {
                status: 'fail',
                statusCode: 500,
                data: { message: 'Failed to reserve seats, please try again' },
            };
        }
    },

    async getNearbyEvents({ userId = null, limit = 6, page = 1 } = {}) {
        let governorateId = null;

        if (userId) {
            const user = await prismaClient.user.findUnique({
                where: { id: userId },
                select: { governorateId: true },
            });

            governorateId = user?.governorateId;
        }

        if (!governorateId) {
            const cairo = await prismaClient.governorate.findUnique({
                where: { name: 'CAIRO' },
                select: { id: true },
            });
            governorateId = cairo.id;
        }

        const { otherGovsIdsSorted } = await prismaClient.governorate.findUnique({
            where: { id: governorateId },
            select: { otherGovsIdsSorted: true },
        });

        const offset = (page - 1) * limit;

        const rows = await prismaClient.$queryRawUnsafe(
            `
  SELECT json_build_object(
      'id', e.id,
      'organizerId', e."organizerId",
      'title', e.title,
      'slug', e.slug,
      'description', e.description,
      'type', e.type,
      'mode', e.mode,
      'venueId', e."venueId",
      'categoryId', e."categoryId",
      'createdAt', e."createdAt",

      'venue', to_jsonb(v),

      --  ticketTypes aggregated without duplication
      'ticketTypes', COALESCE(tt.ticket_types, '[]'::json),

      --  eventSessions aggregated without duplication
      'eventSessions', COALESCE(es.sessions, '[]'::json),

      --  keep these for getBannerAbsUrl()
      'bannerDisk', e."bannerDisk",
      'bannerPath', e."bannerPath"
  ) AS event
  FROM "Event" e
  JOIN "Venue" v ON v.id = e."venueId"

  --  aggregate ticket types
  LEFT JOIN LATERAL (
      SELECT json_agg(tt.*) AS ticket_types
      FROM "TicketType" tt
      WHERE tt."eventId" = e.id
  ) tt ON TRUE

  --  aggregate event sessions
  LEFT JOIN LATERAL (
      SELECT json_agg(es.*) AS sessions
      FROM "EventSession" es
      WHERE es."eventId" = e.id
  ) es ON TRUE

  WHERE v."governorateId" = ANY($1::int[])
  ORDER BY array_position($1::int[], v."governorateId")
  LIMIT $2 OFFSET $3;
  `,
            otherGovsIdsSorted,
            limit,
            offset
        );

        const events = rows.map((r) => r.event);
        const eventIds = events.map((e) => e.id);

        const myInterests = userId
            ? await prismaClient.interestedEvent.findMany({
                  where: { userId, eventId: { in: eventIds } },
                  select: { eventId: true },
              })
            : [];
        const interestedIds = myInterests.map((i) => i.eventId);

        events.forEach((event) => {
            event.ticketTypes?.forEach((ticket) => (ticket.price = parseFloat(ticket.price)));
            event.isInterested = interestedIds.includes(event.id);
        });

        return eventService.getBannerAbsUrl(events);
    },

    async getPersonalizedEvents({ userId = null, limit = 6, page = 1 } = {}) {
        if (!userId) {
            return eventService.getAll({ limit, page });
        }

        const favorite = await prismaClient.attendeeFavoriteCategory.findMany({
            where: { attendeeId: userId },
            select: { categoryId: true },
        });

        const categoryIds = favorite.map((fav) => fav.categoryId);

        const events = await prismaClient.event.findMany({
            where: {
                categoryId: { in: categoryIds },
                deletedAt: null,
            },
            include: {
                venue: {
                    select: {
                        id: true,
                        googlePlaceId: true,
                        latitude: true,
                        longitude: true,
                        name: true,
                        address: true,
                        country: true,
                        state: true,
                        city: true,
                        zipCode: true,
                        createdAt: true,
                        updatedAt: true,
                        governorateId: true,
                    },
                },
                organizer: true,
                category: true,
                ticketTypes: true,
                eventSessions: {
                    where: { status: 'active' },
                    orderBy: { startDate: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const userInterests = await prismaClient.interestedEvent.findMany({
            where: { userId },
            select: { eventId: true },
        });
        const interestedIds = userInterests.map((i) => i.eventId);

        const formattedEvents = events.map((e) => {
            const event = JSON.parse(JSON.stringify(e));

            if (event.ticketTypes) {
                event.ticketTypes.forEach((t) => {
                    t.price = parseFloat(t.price);
                });
            }

            event.isInterested = interestedIds.includes(event.id);
            delete event.interestedEvents;

            return event;
        });

        return eventService.getBannerAbsUrl(formattedEvents);
    },

    async addToInterested({ userId, eventId }) {
        const existing = await eventService.isEventInterested({ userId, eventId });

        if (existing) {
            throw new AppError('Event is already in your interested list', 400);
        }

        const event = await prismaClient.interestedEvent.create({
            data: { userId, eventId },
        });
        return event;
    },

    async removeFromInterested({ userId, eventId }) {
        const existing = await eventService.isEventInterested({ userId, eventId });

        if (!existing) {
            throw new AppError('Event is not in your interested list', 404);
        }

        const deletedEvent = await prismaClient.interestedEvent.delete({
            where: { userId_eventId: { userId, eventId } },
        });
        return deletedEvent;
    },

    async isEventInterested({ userId, eventId }) {
        return await prismaClient.interestedEvent.findUnique({
            where: { userId_eventId: { userId, eventId } },
        });
    },

    async getUserAttendedEvents({ userId }) {
        return await prismaClient.event.count({
            where: {
                ticketTypes: {
                    some: { tickets: { some: { userId /*status: 'valid'*/ } } },
                },
            },
        });
    },

    async createEventRules(eventId, rules, tx = prismaClient) {
        const createdRules = await Promise.all(
            rules.map((rule) =>
                tx.eventRule.create({
                    data: {
                        rule: rule.rule,
                        eventId,
                    },
                })
            )
        );
        return createdRules;
    },

    /**
     * @param {number} eventId
     * @param {{ rule: string }[]} rules
     * @param {TransactionClient | null} [tx]
     */
    async createEventRulesRecord(eventId, rules, tx = null) {
        if (!rules || !rules.length) return [];

        const data = rules.map((rule) => ({
            rule: rule.rule,
            eventId,
        }));

        await eventRuleRepository.bulkInsert({ data }, tx);
        return data;
    },

    async updateEventRules(eventId, newRules, tx = prismaClient) {
        await tx.eventRule.deleteMany({ where: { eventId } });

        if (!newRules.length) return [];

        return await Promise.all(
            newRules.map((rule) =>
                tx.eventRule.create({
                    data: {
                        rule: rule.rule,
                        eventId,
                    },
                })
            )
        );
    },

    /**
     * @param {number} eventId
     * @param {{ rule: string }[]} newRules
     * @param {TransactionClient | null} [tx]
     */
    async updateEventRulesRecord(eventId, newRules, tx = null) {
        const exists = await this.findById(eventId);
        if (!exists) {
            throw new NotFoundError(undefined, undefined, [EventErrors.EVENT_NOT_FOUND]);
        }

        await eventRuleRepository.deleteMany({ where: { eventId } }, tx);

        if (!newRules || !newRules.length) return [];

        return this.createEventRulesRecord(eventId, newRules, tx);
    },

    async createEventTags(eventId, tags, tx = prismaClient) {
        const tagRecords = await Promise.all(
            tags.map((tag) =>
                tx.tag.upsert({
                    where: { name: tag.toLowerCase() },
                    update: {},
                    create: { name: tag.toLowerCase() },
                })
            )
        );

        await tx.eventTag.createMany({
            data: tagRecords.map((tagRecord) => ({
                eventId,
                tagId: tagRecord.id,
            })),
            skipDuplicates: true,
        });

        return tagRecords;
    },

    /**
     * @param {number} eventId
     * @param {string[]} tags
     * @param {TransactionClient | null} [tx]
     */
    async createEventTagsRecord(eventId, tags, tx = null) {
        if (!tags || !tags.length) return [];

        const tagRecords = await Promise.all(
            tags.map((tag) =>
                tagRepository.upsert(
                    {
                        where: { name: tag.toLowerCase() },
                        update: {},
                        create: { name: tag.toLowerCase() },
                    },
                    tx
                )
            )
        );

        await eventTagRepository.bulkInsert(
            {
                data: tagRecords.map((tagRecord) => ({
                    eventId,
                    tagId: tagRecord.id,
                })),
                skipDuplicates: true,
            },
            tx
        );

        return tagRecords;
    },

    async updateEventTags(eventId, tags, tx = prismaClient) {
        await tx.eventTag.deleteMany({ where: { eventId } });

        if (!tags.length) return [];

        const tagRecords = await Promise.all(
            tags.map((tag) => {
                return tx.tag.upsert({
                    where: { name: tag.toLowerCase() },
                    update: {},
                    create: { name: tag.toLowerCase() },
                });
            })
        );

        await tx.eventTag.createMany({
            data: tagRecords.map((tagRecord) => ({
                eventId,
                tagId: tagRecord.id,
            })),
            skipDuplicates: true,
        });

        return tagRecords;
    },

    /**
     * @param {number} eventId
     * @param {string[]} tags
     * @param {TransactionClient | null} [tx]
     */
    async updateEventTagsRecord(eventId, tags, tx = null) {
        await eventTagRepository.deleteMany({ where: { eventId } }, tx);

        if (!tags || !tags.length) return [];

        return this.createEventTagsRecord(eventId, tags, tx);
    },

    async getAllTags(search) {
        const tags = await prismaClient.tag.findMany({
            where: {
                name: {
                    contains: search.toLowerCase(),
                },
            },
            select: { name: true },
            orderBy: { name: 'asc' },
            take: 15,
        });
        return tags;
    },

    ticketsSoldOut(eventId) {
        return prismaClient.ticketType.findMany({
            where: {
                eventId,
                quantity: {
                    gt: 0,
                },
                sold: {
                    gte: prismaClient.ticketType.quantity,
                },
            },
        });
    },

    searchByKeywords(options) {
        return eventRepository.searchByKeywords(options);
    },

    hydrateMatches(matches) {
        return eventRepository.hydrateSearchMatches(matches);
    },

    /**
     * @param {number} id
     * @param {TransactionClient | null} [tx]
     */
    async cancelEvent(id, tx = null) {
        const event = await this.findById(id, {
            relations: {
                eventSessions: true,
            },
        });

        if (!event) {
            throw new NotFoundError(undefined, undefined, [EventErrors.EVENT_NOT_FOUND]);
        }

        event.pendingOrders = await this.countEventOrdersByStatus(id, OrderStatus.PENDING);
        event.completedOrders = await this.countEventOrdersByStatus(id, OrderStatus.COMPLETED);

        const canBeCancelled = event.canBeCancelled();
        if (!canBeCancelled) {
            throw new ConflictError(undefined, undefined, [EventErrors.EVENT_CANNOT_BE_CANCELLED]);
        }

        await eventSessionRepository.cancelSessions(id, tx);
        return eventRepository.softDeleteById(id, tx);
    },
};

export default eventService;
