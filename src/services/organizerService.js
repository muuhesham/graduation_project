import { prisma as prismaClient } from '../config/db.js';
import EventType from '../constants/enums/eventType.js';
import OrganizerErrors from './../constants/messages/errors/organizer.js';
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
import { organizerRepository } from './../repositories/index.js';
import AppError from '../errors/AppError.js';
import NotFoundError from './../errors/NotFoundError.js';
import ConflictError from './../errors/ConflictError.js';
import organizerPolicy from './../policies/OrganizerPolicy.js';
import OrganizerFactory from './../factories/OrganizerFactory.js';
import OrganizerVerificationStatus from './../constants/enums/organizerVerificationStatus.js';

/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 *
 * @typedef {import('@prisma/client').Prisma.TransactionClient} TransactionClient
 *
 * @typedef {import('./../types/models/index.js').Organizer} Organizer
 *
 * @typedef {import('./../types/models/index.js').Business} Business
 *
 * @typedef {import('./../types/models/index.js').Company} Company
 *
 * @typedef {import('./../types/models/index.js').Hobbyist} Hobbyist
 */

/** @typedef {import('./../types/dtos/organizer.dto.js').OrganizerCreateDTO} OrganizerCreateDTO */

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
     * @param {PrismaClient | TransactionClient} [tx=prismaClient] Default is `prismaClient`
     * @returns {Promise<Organizer>}
     */
    async create(userId, dto, tx = prismaClient) {
        const validated = /** @type {OrganizerCreateDTO} */ (pluck(dto, this.allowedFields));
        const normalizedOrganizerData = {
            ...validated,
            contactName: validated.contactPersonName,
            websiteUrl: validated.website,
            reviewedBy: validated.reviewedBy,
        };
        const organizerCreateData = pluck(normalizedOrganizerData, this.organizerCreateFields);

        await Promise.all([
            this.ensureUniqueConstraints(userId, validated),
            this.ensureReferenceConstraints(userId, validated),
        ]);

        const organizer = await tx.organizer.create({
            data: { ...organizerCreateData, userId },
        });
        await OrganizerFactory.createInstance(validated.type).create(
            organizer.id,
            { ...validated, organizerId: organizer.id },
            tx
        );

        return organizer;
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
            throw new ConflictError(
                OrganizerErrors.ORGANIZER_REFERENCE_CONSTRAINT_VIOLATION.message,
                OrganizerErrors.ORGANIZER_REFERENCE_CONSTRAINT_VIOLATION.code,
                errors
            );
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
            throw new ConflictError(
                OrganizerErrors.ORGANIZER_ALREADY_EXISTS.message,
                OrganizerErrors.ORGANIZER_ALREADY_EXISTS.code,
                errors
            );
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

    async cancelEvent({ userId, eventId, tx }) {
        const organizer = await organizerService.getByUserId(userId);
        if (!organizer) {
            throw new AppError('Organizer not found');
        }
        await tx.event.update({
            where: { id: eventId, organizerId: organizer.id },
            data: {
                deletedAt: new Date(),
                eventSessions: {
                    updateMany: {
                        where: {},
                        data: { status: SessionStatus.CANCELLED },
                    },
                },
            },
        });
    },

    /**
     * @private
     * @param {Organizer} organizer
     * @param {string} contactEmail
     * @returns {Promise<void>}
     */
    async sendOrganizerContactEmailOtp(organizer, contactEmail) {
        const normalizedContactEmail = contactEmail.trim().toLowerCase();
        const otp = otpService.generateOtp();

        await Promise.all([
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
     * @private
     * @param {Organizer} organizer
     * @returns {string}
     */
    getVerifiedOrganizerContactEmail(organizer) {
        const organizerContactEmail = organizer.contactEmail?.trim().toLowerCase();

        if (!organizerContactEmail) {
            throw new AppError('Contact email is required', 400, 'CONTACT_EMAIL_REQUIRED');
        }

        return organizerContactEmail;
    },

    /**
     * @param {string} userId
     */
    async requestOrganizerContactEmailVerification(userId) {
        const organizer = await this.getByUserId(userId);

        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }

        if (organizer.isContactEmailVerified) {
            throw new AppError(
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED.message,
                400,
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED.code
            );
        }

        const contactEmail = this.getVerifiedOrganizerContactEmail(organizer);

        await this.sendOrganizerContactEmailOtp(organizer, contactEmail);
    },

    /**
     * @param {string} userId
     * @returns {Promise<void>}
     */
    async resendOrganizerContactEmailVerification(userId) {
        const organizer = await this.getByUserId(userId);

        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }

        if (organizer.isContactEmailVerified) {
            throw new AppError(
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED.message,
                400,
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED.code
            );
        }

        const contactEmail = this.getVerifiedOrganizerContactEmail(organizer);

        await this.sendOrganizerContactEmailOtp(organizer, contactEmail);
    },

    /**
     * @param {string} userId
     * @param {object} input
     * @param {string} input.otp
     */
    async verifyOrganizerContactEmail(userId, input) {
        const organizer = await this.getByUserId(userId);

        if (!organizer) {
            throw new NotFoundError(
                OrganizerErrors.ORGANIZER_NOT_FOUND.message,
                OrganizerErrors.ORGANIZER_NOT_FOUND.code
            );
        }

        if (organizer.isContactEmailVerified) {
            throw new AppError(
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED.message,
                400,
                OrganizerErrors.ORGANIZER_CONTACT_EMAIL_ALREADY_VERIFIED.code
            );
        }

        const contactEmail = this.getVerifiedOrganizerContactEmail(organizer);

        await otpService.verifyEmailOtp(contactEmail, input?.otp);

        await prismaClient.organizer.update({
            where: { id: organizer.id },
            data: { isContactEmailVerified: true },
        });
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
     */
    findById(organizerId) {
        return organizerRepository.findById(organizerId);
    },

    /**
     * @param {string} organizerId
     * @param {object} data
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
};

export default organizerService;
