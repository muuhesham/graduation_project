import { prisma as prismaClient } from '../config/db.js';
import EventType from '../constants/enums/eventType.js';
import OrganizerErrors from './../constants/messages/errors/organizer.js';
import CategoryErrors from './../constants/messages/errors/category.js';
import EventErrors from './../constants/messages/errors/event.js';
import { pluck } from './../helpers/pluck.js';
import eventService from './eventService.js';
import ticketTypeService from './ticketTypeService.js';
import venueService from './venueService.js';
import fileService from './fileService.js';
import categoryService from '../services/categoryService.js';
import notificationService from './notificationService.js';
import seatService from './seatService.js';
import SessionStatus from '../constants/enums/sessionStatus.js';
import locationService from './locationService.js';
import mailService from './mailService.js';
import otpService from './otpService.js';
import orderService from './orderService.js';
import { organizerRepository, organizerFollowerRepository } from './../repositories/index.js';
import AppError from '../errors/AppError.js';
import NotFoundError from './../errors/NotFoundError.js';
import ConflictError from './../errors/ConflictError.js';
import organizerPolicy from './../policies/OrganizerPolicy.js';
import OrganizerFactory from './../factories/OrganizerFactory.js';
import OrganizerVerificationStatus from './../constants/enums/organizerVerificationStatus.js';
import OrganizerStatus from './../constants/enums/organizerStatus.js';
import { Company } from '../models/index.js';

/**
 * @typedef {import('./../types/shared').TransactionClient} TransactionClient
 * @typedef {import('./../types/models').Organizer} Organizer
 * @typedef {import('./../types/models').OrganizerHydrated} OrganizerHydrated
 * @typedef {import('./../types/models').Event} Event
 * @typedef {import('./../types/models').EventHydrated} EventHydrated
 * @typedef {import('./../types/models').Venue} Venue
 * @typedef {import('./../types/models').EventPaginatedResource} EventPaginatedResource
 * @typedef {import('./../types/dtos/organizer.dto').OrganizerCreateDTO} OrganizerCreateDTO
 */

const organizerService = {
    /**
     * @private
     * @type {locationService}
     */
    locationService: locationService,

    /**
     * @private
     * @typedef {import('./../policies/OrganizerPolicy.js').default} OrganizerPolicy
     */
    organizerPolicy: organizerPolicy,

    /**
     * @private
     * @type {string[]}
     */
    allowedFields: [
        'type',
        'organizerType',
        'name',
        'description',
        'website',
        'contactPersonName',
        'contactEmail',
        'contactPhone',
        'instagramUrl',
        'facebookUrl',
        'twitterUrl',
        'linkedinUrl',
        'youtubeUrl',
        'logoDisk',
        'logoPath',
        'coverDisk',
        'coverPath',
        'profilePhotoDisk',
        'profilePhotoPath',
        'nationalId',
        'ownerName',
        'commercialRegistration',
        'taxId',
        'registrationNumber',
        'officialEmailDomain',
        'officialDocumentsDisk',
        'officialDocumentsPath',
        'address',
        'cityId',
        'stateId',
        'countryId',
        'isApproved',
        'verificationStatus',
        'status',
        'suspendReason',
        'rejectionReason',
        'reviewedBy',
        'reviewedAt',
    ],

    /**
     * @private
     * @type {string[]}
     */
    organizerCreateFields: [
        'type',
        'name',
        'description',
        'contactName',
        'contactEmail',
        'contactPhone',
        'websiteUrl',
        'instagramUrl',
        'facebookUrl',
        'twitterUrl',
        'linkedinUrl',
        'youtubeUrl',
        'logoDisk',
        'logoPath',
        'coverDisk',
        'coverPath',
        'address',
        'cityId',
        'stateId',
        'countryId',
        'verificationStatus',
        'status',
        'suspendReason',
        'rejectionReason',
        'reviewedBy',
        'reviewedAt',
    ],

    /**
     * @param {string} userId
     * @param {OrganizerCreateDTO} dto
     * @param {TransactionClient} [tx=prismaClient]
     * @returns {Promise<Organizer>}
     */
    create(userId, dto, tx = prismaClient) {
        return this.createRecord(userId, dto, null, tx);
    },

    /**
     * @param {string} userId
     * @param {OrganizerCreateDTO} dto
     * @param {any} [file]
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<Organizer>}
     */
    async createRecord(userId, dto, file = null, tx = null) {
        if (file && dto.type === 'company') {
            const saved = await fileService.save(file, Company.getUploadPath(userId));
            if (saved) {
                dto.officialDocumentsDisk = saved.disk;
                dto.officialDocumentsPath = saved.url;
            }
        }

        const normalizedOrganizerData = {
            ...dto,
            contactName: dto.contactPersonName || dto.contactName,
            websiteUrl: dto.website || dto.websiteUrl,
            verificationStatus: OrganizerVerificationStatus.UNDER_REVIEW,
            status: OrganizerStatus.ACTIVE,
        };

        await Promise.all([
            this.ensureUniqueConstraints(userId, dto),
            this.ensureReferenceConstraints(userId, dto),
        ]);

        const organizer = await organizerRepository.runInTransaction(async (transaction) => {
            const useTx = tx || transaction;

            const organizerCreateData = {
                ...pluck(normalizedOrganizerData, this.organizerCreateFields),
                userId,
            };
            const createdOrganizer = await organizerRepository.create(organizerCreateData, useTx);

            await OrganizerFactory.create(
                normalizedOrganizerData.type,
                createdOrganizer.id,
                normalizedOrganizerData,
                useTx
            );

            return createdOrganizer;
        });

        return /** @type {Organizer} */ (await this.findById(organizer.id, tx));
    },

    /**
     * @private
     * @param {string} userId
     * @param {OrganizerCreateDTO} organizerData
     */
    async ensureReferenceConstraints(userId, organizerData) {
        const countryId = /** @type {number} */ (organizerData.countryId);
        const stateId = /** @type {number} */ (organizerData.stateId);
        const cityId = /** @type {number} */ (organizerData.cityId);

        const [country, state, city] = await Promise.all([
            this.locationService.findCountryById(countryId),
            this.locationService.findStateById(stateId),
            this.locationService.findCityById(cityId),
        ]);

        const errors = [];
        if (!country) {
            errors.push({ field: 'countryId', message: 'Referenced country does not exist' });
        }
        if (!state) {
            errors.push({ field: 'stateId', message: 'Referenced state does not exist' });
        }
        if (!city) {
            errors.push({ field: 'cityId', message: 'Referenced city does not exist' });
        }
        if (errors.length > 0) {
            throw new ConflictError(undefined, undefined, errors);
        }
    },

    /**
     * @private
     * @param {string} userId
     * @param {OrganizerCreateDTO} organizerData
     */
    async ensureUniqueConstraints(userId, organizerData) {
        const [existsByEmail, existsByPhone] = await Promise.all([
            this.findByContactEmail(organizerData.contactEmail),
            this.findByContactPhone(organizerData.contactPhone),
        ]);

        const errors = [];
        if (existsByEmail) {
            errors.push({
                field: 'contactEmail',
                message: 'Contact email is already in use by another organizer',
            });
        }
        if (existsByPhone) {
            errors.push({
                field: 'contactPhone',
                message: 'Contact phone is already in use by another organizer',
            });
        }
        if (errors.length > 0) {
            throw new ConflictError(undefined, undefined, errors);
        }
    },

    async createEvent(
        userId,
        {
            title,
            categoryName,
            sessions,
            location,
            description,
            banner,
            tickets,
            type,
            mode,
            eventType,
            seatsData,
            numberOfRows,
            numberOfColumns,
            priceTiers,
            eventRules,
            tags,
        }
    ) {
        const [organizer, category] = await Promise.all([
            organizerService.getByUserId(userId),
            categoryService.getByCategory(categoryName),
        ]);
        if (!organizer) {
            return {
                status: 'fail',
                data: { error: 'Organizer profile not found' },
            };
        }

        if (!organizer.isApproved) {
            return {
                status: 'fail',
                data: { error: 'Organizer is not approved to create events' },
            };
        }

        if (!category) return { status: 'fail', data: { error: 'Invalid category' } };
        let result;
        try {
            const result = await prismaClient.$transaction(
                async (tx) => {
                    const venue = await venueService.create(location, tx);
                    if (venue.message) {
                        throw new Error(venue.message);
                    }
                    const event = await eventService.create(
                        organizer.id,
                        {
                            title,
                            description,
                            banner,
                            mode,
                            type,
                            venueId: venue.id,
                            categoryId: category.id,
                            eventType,
                        },
                        tx
                    );
                    const eventSessions = await eventService.createBulkSessions(
                        event.id,
                        sessions,
                        tx
                    );
                    let ticketTypes = [];
                    if (tickets && tickets.length > 0 && type === EventType.TICKETED) {
                        ticketTypes = await ticketTypeService.createBulkTickets(
                            event.id,
                            tickets,
                            tx
                        );
                    } else if (tickets && tickets.length > 0 && type === EventType.FREE) {
                        ticketTypes = await ticketTypeService.createFreeBulkTickets(
                            event.id,
                            tickets,
                            tx
                        );
                    }
                    if (eventType === 'seatmap') {
                        await seatService.createEventSeatTiers(
                            priceTiers,
                            numberOfRows,
                            numberOfColumns,
                            event.id,
                            tx
                        );
                        await seatService.createEventSeats(seatsData, event.id, tx);
                    }

                    let rulesData = [];
                    let tagsData = [];
                    if (eventRules && eventRules.length > 0) {
                        rulesData = await eventService.createEventRules(event.id, eventRules, tx);
                    }

                    if (tags && tags.length > 0) {
                        tagsData = await eventService.createEventTags(event.id, tags, tx);
                    }

                    const eventResponse = {
                        ...event,
                        rules: rulesData.map((r) => r.rule),
                        tags: tagsData.map((t) => t.name),
                    };

                    return { event: eventResponse, ticketTypes, venue, eventSessions };
                },
                {
                    timeout: 50000,
                }
            );

            await notificationService.notifyEventCreated(
                organizer.id,
                result.event.id,
                result.event.title,
                categoryName
            );

            return {
                status: 'success',
                data: result,
            };
        } catch (err) {
            if (result?.event.bannerPath) {
                await fileService.delete(result?.event.bannerPath);
            }
            throw err;
        }
    },

    /**
     * @param {string} userId
     * @param {object} input
     * @returns {Promise<EventHydrated>}
     */
    async createOrganizerEvent(userId, input) {
        const [organizer, category] = await Promise.all([
            this.findByUserId(userId),
            categoryService.getByCategory(input.categoryName),
        ]);

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        if (!category) {
            throw new NotFoundError(undefined, undefined, [CategoryErrors.CATEGORY_NOT_FOUND]);
        }

        organizerPolicy.canCreateEvent(organizer);

        return organizerRepository.runInTransaction(async (tx) => {
            const venue = await venueService.createRecord(input.location, tx);

            const event = await eventService.createRecord(
                organizer.id,
                {
                    ...input,
                    venueId: venue.id,
                    categoryId: category.id,
                },
                tx
            );

            await eventService.createSessionsRecord(event.id, input.sessions, tx);
            await ticketTypeService.createBulkRecord(
                event.id,
                input.tickets,
                { eventType: input.type },
                tx
            );
            await this.handleEventSubResources(event.id, input, tx);

            if (event.hasSeatMap) {
                await this.handleSeatMapResources(event.id, input, tx);
            }

            return /** @type {EventHydrated} */ (eventService.findById(event.id, {}, tx));
        });
    },

    /**
     * @private
     * @param {number} eventId
     * @param {object} input
     * @param {TransactionClient} tx
     */
    async handleEventSubResources(eventId, input, tx) {
        if (input.eventRules?.length > 0) {
            await eventService.createEventRulesRecord(eventId, input.eventRules, tx);
        }
        if (input.tags?.length > 0) {
            await eventService.createEventTagsRecord(eventId, input.tags, tx);
        }
    },

    /**
     * @private
     * @param {number} eventId
     * @param {object} input
     * @param {TransactionClient} tx
     */
    async handleSeatMapResources(eventId, input, tx) {
        await seatService.createTiers(
            eventId,
            {
                priceTiers: input.priceTiers,
                numberOfRows: input.numberOfRows,
                numberOfColumns: input.numberOfColumns,
            },
            tx
        );
        await seatService.createSeats(eventId, input.seatsData, tx);
    },

    async updateEvent(
        userId,
        eventId,
        {
            title,
            categoryName,
            description,
            banner,
            tickets,
            sessions,
            type,
            mode,
            location,
            eventRules,
            tags,
        }
    ) {
        const [organizer, event, category] = await Promise.all([
            organizerService.getByUserId(userId),
            eventService.getById(eventId),
            categoryService.getByCategory(categoryName),
        ]);

        if (!organizer) {
            return { status: 'fail', data: { error: 'Organizer not found' } };
        }

        if (!event) {
            return { status: 'fail', data: { error: `Event doesn't exist` } };
        }

        if (event.organizerId !== organizer.id) {
            return { status: 'fail', data: { error: 'Unauthorized to update this event' } };
        }

        if (!category) return { status: 'fail', data: { error: 'Invalid category' } };

        let oldBannerPath = event.bannerPath;
        let result;
        try {
            result = await prismaClient.$transaction(
                async (tx) => {
                    let updatedVenueId = event.venueId;
                    if (location) {
                        const updatedVenue = await venueService.update(event.venueId, location, tx);
                        if (updatedVenue.message) {
                            return { status: 'fail', data: { error: updatedVenue.message } };
                        }

                        updatedVenueId = updatedVenue.id;
                    }

                    const updatedEvent = await eventService.update(
                        eventId,
                        organizer.id,
                        {
                            title,
                            description,
                            banner,
                            mode,
                            type,
                            categoryId: category.id,
                            venueId: updatedVenueId,
                        },
                        tx
                    );

                    if (sessions && sessions.length > 0) {
                        await eventService.deleteSessions(eventId, tx);
                        await eventService.createBulkSessions(updatedEvent.id, sessions, tx);
                    }

                    // if (tickets && tickets.length > 0) {
                    //     await ticketTypeService.deleteTickets(eventId, tx);

                    //     if (type === EventType.TICKETED) {
                    //         await ticketTypeService.createBulkTickets(eventId, tickets, tx);
                    //     } else if (type === EventType.FREE) {
                    //         await ticketTypeService.createFreeBulkTickets(eventId, tickets, tx);
                    //     }
                    // }

                    let rulesData = updatedEvent.rules || [];
                    let tagsData = updatedEvent.tags || [];
                    if (eventRules !== undefined) {
                        rulesData = await eventService.updateEventRules(eventId, eventRules, tx);
                    }

                    if (tags !== undefined) {
                        tagsData = await eventService.updateEventTags(eventId, tags, tx);
                    }

                    const eventResponse = {
                        ...updatedEvent,
                        rules: rulesData.map((r) => r.rule || r),
                        tags: tagsData
                            .map((t) => {
                                if (t.name) return t.name;
                                if (t.tag && t.tag.name) return t.tag.name;
                                if (typeof t === 'string') return t;
                                return null;
                            })
                            .filter(Boolean),
                    };

                    return { updatedEvent: eventResponse };
                },
                {
                    timeout: 15000, // 15 seconds
                }
            );

            if (banner && oldBannerPath) {
                await fileService
                    .delete(oldBannerPath)
                    .catch((e) => console.log('Old banner delete failed', e));
            }

            const interestedUsers = await prismaClient.interestedEvent.findMany({
                where: {eventId},
                select: { userId: true },
            });
            const userIds = interestedUsers.map((user) => user.userId);
            await notificationService.notifyEventUpdated(eventId, result.updatedEvent.title, userIds);

            return {
                status: 'success',
                data: {
                    message: 'Event updated successfully',
                    event: result.updatedEvent,
                },
            };
        } catch (err) {
            if (result?.updatedEvent?.bannerPath) {
                await fileService
                    .delete(result.updatedEvent.bannerPath)
                    .catch((e) => console.log('Rollback banner delete failed', e));
            }
            throw err;
        }
    },

    /**
     * @param {string} userId
     * @param {number} eventId
     * @param {object} input
     * @returns {Promise<EventHydrated>}
     */
    async updateOrganizerEvent(userId, eventId, input) {
        const [organizer, event] = await Promise.all([
            this.findByUserId(userId),
            eventService.findById(eventId),
        ]);

        if (!event) {
            throw new NotFoundError(undefined, undefined, [EventErrors.EVENT_NOT_FOUND]);
        }

        organizerPolicy.canUpdateEvent(organizer, event);

        return organizerRepository.runInTransaction(async (tx) => {
            if (input.location) {
                await venueService.updateRecord(event.venueId, input.location, tx);
            }

            await eventService.updateRecord(eventId, organizer.id, input, tx);

            if (input.sessions?.length > 0) {
                await eventService.deleteSessionsRecord(eventId, tx);
                await eventService.createSessionsRecord(eventId, input.sessions, tx);
            }

            if (input.eventRules !== undefined) {
                await eventService.updateEventRulesRecord(eventId, input.eventRules, tx);
            }
            if (input.tags !== undefined) {
                await eventService.updateEventTagsRecord(eventId, input.tags, tx);
            }

            return eventService.findById(eventId, {}, tx);
        });
    },

    async deleteEvent(userId, eventId) {
        const [event, organizer] = await Promise.all([
            eventService.getById(eventId),
            organizerService.getByUserId(userId),
        ]);

        if (!event) {
            return {
                status: 'fail',
                data: { error: `Event doesn't exist` },
            };
        }

        if (!organizer) {
            return {
                status: 'fail',
                data: { error: 'Organizer profile not found' },
            };
        }

        if (!organizer.isApproved) {
            return {
                status: 'fail',
                data: { error: 'Organizer is not approved to delete events' },
            };
        }

        if (event.organizerId !== organizer.id) {
            return {
                status: 'fail',
                data: { error: 'Unauthorized to delete this event' },
            };
        }

        // check if the event related to tickets -> can't delete else -> soft delete or hard delete

        let result;
        try {
            // result = await eventService.delete(eventId);
            result = await eventService.softDelete(eventId);
        } catch (err) {
            if (err.code === 'P2003') {
                return {
                    status: 'fail',
                    data: { error: `The event related to tickets can't be deleted` },
                };
            }
            throw err;
        }

        if (result?.bannerPath) {
            await fileService
                .delete(result.bannerPath)
                .catch((e) => console.log('Rollback banner delete failed', e));
        }

        return {
            status: 'success',
            data: {
                message: 'Event deleted successfully',
            },
        };
    },

    /**
     * @param {string} userId
     * @param {number} eventId
     * @returns {Promise<any>}
     */
    async deleteOrganizerEvent(userId, eventId) {
        const [organizer, event] = await Promise.all([
            this.findByUserId(userId),
            eventService.findById(eventId),
        ]);

        if (!event) {
            throw new NotFoundError(undefined, undefined, [EventErrors.EVENT_NOT_FOUND]);
        }

        organizerPolicy.canDeleteEvent(organizer, event);

        return eventService.softDelete(eventId);
    },

    async getByUserId(userId) {
        return prismaClient.organizer.findFirst({
            where: { userId },
            include: {
                hobbyist: true,
                business: true,
                company: true,
                user: true,
            },
        });
    },

    /**
     * @param {string} userId
     * @returns {Promise<Organizer | null>}
     */
    async findByUserId(userId) {
        return organizerRepository.findByUserId(userId);
    },
    async listEvents(userId) {
        const organizer = await organizerService.getByUserId(userId);

        if (!organizer) {
            return {
                status: 'fail',
                data: { error: 'Organizer not found' },
            };
        }

        const organizerId = organizer.id;

        const events = await prismaClient.event.findMany({
            where: { organizerId },
            select: {
                id: true,
                organizerId: true,
                title: true,
                description: true,
                venueId: true,
                bannerDisk: true,
                bannerPath: true,
                venue: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        const result = await eventService.getBannerAbsUrl(events);

        return {
            status: 'success',
            data: {
                result,
            },
        };
    },

    /**
     * @param {string} userId
     * @returns {Promise<EventPaginatedResource>}
     */
    async listOrganizerEvents(userId) {
        const organizer = await this.findByUserId(userId);
        this.organizerPolicy.canAccessDashboard(organizer);

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        return eventService.list({
            where: { organizerId: organizer.id },
            include: { venue: { select: { name: true } } },
        });
    },
    /**
     * @param {object} params
     * @param {string} params.userId
     * @param {number} params.eventId
     * @param {TransactionClient} params.tx
     */
    async cancelEvent({ userId, eventId, tx }) {
        const organizer = await this.findByUserId(userId);
        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        return eventService.cancelEvent(eventId, tx);
    },

    /**
     * @param {string} userId
     * @param {number} eventId
     * @returns {Promise<void>}
     */
    async cancelOrganizerEvent(userId, eventId) {
        const organizer = await this.findByUserId(userId);
        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        return organizerRepository.runInTransaction(async (tx) => {
            await eventService.cancelEvent(eventId, tx);
            await orderService.refundOrdersRecord({ eventId, tx });
        });
    },

    /**
     * @private
     * @param {Organizer} organizer
     * @param {string} contactEmail
     * @returns {Promise<void>}
     */
    async sendEmailOtp(organizer, contactEmail) {
        const normalizedContactEmail = contactEmail.trim().toLowerCase();
        const otp = otpService.generateOtp();

        return Promise.all([
            mailService.sendOtpJob(
                {
                    name: organizer.name || organizer.user?.name || 'there',
                    email: normalizedContactEmail,
                },
                otp,
                otpService.OTP_EXPIRATION
            ),
            otpService.storeOrUpdateOtp(normalizedContactEmail, otp, otpService.OTP_EXPIRATION),
        ]);
    },

    /**
     * @param {string} userId
     */
    async requestEmailOtp(userId) {
        const organizer = await this.findByUserId(userId);

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        if (organizer.isContactEmailVerified) {
            throw new ConflictError(undefined, undefined, [
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED,
            ]);
        }

        return this.sendEmailOtp(organizer, organizer.contactEmail);
    },

    /**
     * @param {string} userId
     * @param {{ otp: string }} input
     * @param {TransactionClient | null} [tx]
     * @returns {Promise<Organizer>}
     */
    async verifyContactEmail(userId, input, tx = null) {
        const organizer = await this.findByUserId(userId);

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        if (organizer.isContactEmailVerified) {
            throw new ConflictError(undefined, undefined, [
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED,
            ]);
        }

        await otpService.verifyEmailOtpRecord(organizer.contactEmail, input?.otp, tx);

        return organizerRepository.update(
            {
                where: { id: organizer.id },
                data: { isContactEmailVerified: true },
            },
            tx
        );
    },

    /**
     * @param {string} email
     * @return {Promise<Organizer | null>}
     */
    findByContactEmail(email) {
        if (!email) return Promise.resolve(null);

        return prismaClient.organizer.findFirst({
            where: { contactEmail: email },
        });
    },

    /**
     * @param {string} phone
     * @return {Promise<Organizer | null>}
     */
    findByContactPhone(phone) {
        if (!phone) return Promise.resolve(null);

        return prismaClient.organizer.findFirst({
            where: { contactPhone: phone },
        });
    },

    findByVerificationStatus(verificationStatus, { page = 1, limit = 20 }) {
        return organizerRepository.findByVerificationStatus(verificationStatus, { page, limit });
    },

    /**
     * @param {{ status?: import('@prisma/client').$Enums.OrganizerStatus, verificationStatus?: import('@prisma/client').$Enums.OrganizerVerficiationStatus, page?: number, limit?: number }} [options]
     */
    list(options = {}) {
        return organizerRepository.list(options);
    },

    /**
     * @param {string} organizerId
     * @param {TransactionClient | null} [tx]
     */
    findById(organizerId, tx = null) {
        return organizerRepository.findById(organizerId, {}, tx);
    },

    /**
     * @param {string} organizerId
     * @param {TransactionClient | null} [tx]
     */
    updateModerationState(organizerId, data) {
        return organizerRepository.update({
            where: { id: organizerId },
            data,
        });
    },

    countByVerificationStatus(verificationStatus) {
        return organizerRepository.countByVerificationStatus(verificationStatus);
    },

    async countAllOrganizers() {
        return organizerRepository.countAllOrganizers();
    },

    async getReviewQueue({ page = 1, limit = 20 } = {}) {
        return organizerRepository.findByVerificationStatus(
            OrganizerVerificationStatus.UNDER_REVIEW,
            { page, limit }
        );
    },

    /**
     * @param {string} userId
     * @param {object} input
     * @param {object} [files]
     * @returns {Promise<Organizer>}
     */
    async updateSettings(userId, settings, files) {
        const organizer = await this.findByUserId(userId);
        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        const updateData = pluck(settings, [
            'name',
            'description',
            'contactName',
            'contactEmail',
            'contactPhone',
            'websiteUrl',
            'instagramUrl',
            'facebookUrl',
            'twitterUrl',
            'linkedinUrl',
            'youtubeUrl',
            'address',
        ]);

        if (updateData.contactEmail && updateData.contactEmail !== organizer.contactEmail) {
            // Check for uniqueness
            const existing = await organizerRepository.findOne({
                where: { contactEmail: updateData.contactEmail },
            });
            if (existing && existing.id !== organizer.id) {
                throw new ConflictError(undefined, undefined, [
                    OrganizerErrors.ORGANIZER_EMAIL_ALREADY_IN_USE,
                ]);
            }
            updateData.isContactEmailVerified = false;
        }

        if (updateData.contactPhone && updateData.contactPhone !== organizer.contactPhone) {
            // Check for uniqueness
            const existing = await organizerRepository.findOne({
                where: { contactPhone: updateData.contactPhone },
            });
            if (existing && existing.id !== organizer.id) {
                throw new ConflictError(undefined, undefined, [
                    OrganizerErrors.ORGANIZER_PHONE_ALREADY_IN_USE,
                ]);
            }
            updateData.isContactPhoneVerified = false;
        }

        if (files.logo) {
            const saved = await fileService.save(files.logo, `organizers/${organizer.id}/logo`);
            updateData.logoDisk = saved.disk;
            updateData.logoPath = saved.path;

            if (organizer.logoPath) {
                await fileService.delete(organizer.logoPath, organizer.logoDisk).catch(() => {});
            }
        }

        if (files.cover) {
            const saved = await fileService.save(files.cover, `organizers/${organizer.id}/cover`);
            updateData.coverDisk = saved.disk;
            updateData.coverPath = saved.path;

            if (organizer.coverPath) {
                await fileService.delete(organizer.coverPath, organizer.coverDisk).catch(() => {});
            }
        }

        return organizerRepository.update({
            where: { id: organizer.id },
            data: updateData,
        });
    },

    /**
     * @param {string} userId
     * @returns {Promise<void>}
     */
    async requestPhoneOtp(userId) {
        const organizer = await this.findByUserId(userId);
        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        if (organizer.isContactPhoneVerified) {
            throw new ConflictError(undefined, undefined, [
                OrganizerErrors.ORGANIZER_CONTACT_PHONE_ALREADY_VERIFIED,
            ]);
        }

        await otpService.requestPhoneOtpRecord(organizer.contactPhone);
    },

    /**
     * @param {string} userId
     * @param {string} otp
     * @returns {Promise<Organizer>}
     */
    async verifyPhoneOtp(userId, otp) {
        const organizer = await this.findByUserId(userId);
        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        if (organizer.isContactPhoneVerified) {
            throw new ConflictError(undefined, undefined, [
                OrganizerErrors.ORGANIZER_CONTACT_PHONE_ALREADY_VERIFIED,
            ]);
        }

        return organizerRepository.runInTransaction(async (tx) => {
            await otpService.verifyPhoneOtpRecord(organizer.contactPhone, otp, tx);

            return organizerRepository.update(
                {
                    where: { id: organizer.id },
                    data: { isContactPhoneVerified: true },
                },
                tx
            );
        });
    },

    /**
     * @param {string} organizerId
     * @param {string} [currentUserId]
     * @returns {Promise<Organizer & { isFollowing: boolean }>}
     */
    async getPublicProfile(organizerId, currentUserId) {
        const organizer = /** @type {any} */ (
            await organizerRepository.findById(organizerId, {
                include: {
                    _count: {
                        select: { followers: true },
                    },
                    Event: {
                        where: {
                            deletedAt: null,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                        include: {
                            venue: { select: { name: true } },
                        },
                    },
                },
            })
        );

        if (!organizer) {
            throw new NotFoundError(undefined, undefined, [OrganizerErrors.ORGANIZER_NOT_FOUND]);
        }

        if (currentUserId) {
            organizer.isFollowing = await organizerFollowerRepository.isFollowing(
                currentUserId,
                organizerId
            );
        }

        return organizer;
    },
};

export default organizerService;
