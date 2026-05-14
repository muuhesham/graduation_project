import eventService from './eventService.js';
import categoryService from './categoryService.js';

const homeService = {
    async latestEvents({ userId = null, limit = 6, page = 1 } = {}) {
        return await eventService.getLatest({ userId, limit, page });
    },

    async newEventsThisWeek({ userId = null, limit = 6, page = 1 } = {}) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const relations = {
            venue: {
                omit: {
                    id: true,
                    updatedAt: true,
                    createdAt: true,
                },
            },
            ticketTypes: {
                omit: {
                    id: true,
                    eventId: true,
                    updatedAt: true,
                    createdAt: true,
                },
            },
            interestedEvents: {},
            _count: {
                select: { interestedEvents: true },
            },
        };

        return eventService.getCreatedBetween(oneWeekAgo, new Date(), {
            limit,
            page,
            relations,
            userId,
        });
    },

    async getCategories({ limit = 6, page = 1 } = {}) {
        return categoryService.getAll({ limit, page });
    },

    async pastEventsAndHighlights({ userId = null, limit = 6, page = 1 } = {}) {
        const orderBy = [
            {
                createdAt: 'desc',
            },
        ];

        const relations = {
            venue: {
                omit: {
                    id: true,
                    updatedAt: true,
                    createdAt: true,
                },
            },
            ticketTypes: {
                omit: {
                    id: true,
                    eventId: true,
                    updatedAt: true,
                    createdAt: true,
                },
            },
            interestedEvents: {},
            _count: {
                select: { interestedEvents: true },
            },
        };

        const selections = {
            id: true,
            title: true,
            slug: true,
            description: true,
            bannerPath: true,
            bannerDisk: true,
            organizerId: true,
            ticketTypes: true,
            eventSessions: true,
        };
        const now = new Date();

        return eventService.getCreatedBetween(new Date('2000-01-01'), now, {
            relations,
            limit,
            page,
            orderBy,
            selections,
            userId,
        });
    },

    async nearbyEvents({ userId = null, limit = 6, page = 1 } = {}) {
        return eventService.getNearbyEvents({ userId, limit, page });
    },

    async personalizedEvents({ userId = null, limit = 6, page = 1 } = {}) {
        return eventService.getPersonalizedEvents({ userId, limit, page });
    },
};

export default homeService;
