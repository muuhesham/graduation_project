import eventFactory, { egyptianScenarios } from '../factories/event.factory.js';
import SessionStatus from './../../src/constants/enums/sessionStatus.js';
import EventStatus from './../../src/constants/enums/eventStatus.js';
import { faker } from '@faker-js/faker';

async function seedEvents(prisma, { categories, venues, organizers }) {
    let events = [];
    const countToSeed = 300; // Reduced for performance but higher quality
    console.log(`Seeding events: ${countToSeed} records with enhanced realism...`);

    const tags = await prisma.tag.findMany();

    const createSession = (offsetDays = 0) => {
        const start = new Date();
        start.setDate(start.getDate() + offsetDays);
        start.setHours(faker.number.int({ min: 9, max: 20 }), 0, 0, 0);

        const end = new Date(start);
        end.setHours(end.getHours() + faker.number.int({ min: 2, max: 6 }));

        return { startDate: start, endDate: end, status: SessionStatus.ACTIVE };
    };

    if (!categories.length || !venues.length || !organizers.length) {
        console.log('⚠️ Skipping events seeding: missing related data.');
        return [];
    }

    for (let i = 0; i < countToSeed; i++) {
        const scenario = egyptianScenarios[i % egyptianScenarios.length];
        const venue = venues[Math.floor(Math.random() * venues.length)];
        const organizer = organizers[Math.floor(Math.random() * organizers.length)];
        const category =
            categories.find((c) => c.name === scenario.category) ||
            categories[Math.floor(Math.random() * categories.length)];

        const matchedTags = tags.filter((t) =>
            scenario.tags.some((st) => t.name.toLowerCase().includes(st.toLowerCase()))
        );
        const finalTags = matchedTags.length > 0 ? matchedTags.slice(0, 3) : tags.slice(0, 3);

        // Date Buckets for homepage variety
        let offset;
        if (i < 20) offset = faker.number.int({ min: 0, max: 2 }); // Starting Soon
        else if (i < 50) offset = faker.number.int({ min: 3, max: 7 }); // This Week
        else if (i < 100) offset = faker.number.int({ min: -30, max: -1 }); // Past Events
        else offset = faker.number.int({ min: 8, max: 365 }); // Future

        let status = EventStatus.ACTIVE;
        if (Math.random() > 0.95) status = EventStatus.CANCELLED;

        const baseData = eventFactory({
            title: `${scenario.topic} ${faker.number.int({ min: 2025, max: 2027 })}`,
            description: scenario.description,
            categoryId: category.id,
            status: status,
        });

        delete baseData._scenario;

        // Logical Tickets
        const ticketTypesData = scenario.tiers.map((tierName, idx) => {
            const range = scenario.priceRange;
            const price = range.min === 0 ? 0 : Math.round(range.min + (range.max - range.min) * (idx / scenario.tiers.length));
            return {
                name: tierName,
                price: price,
                quantity: idx === 0 ? 300 : 50, // More general tickets, fewer VIP
            };
        });

        const isSeated = Math.random() > 0.85;

        const event = await prisma.event.create({
            data: {
                ...baseData,
                hasSeatMap: isSeated,
                venueId: venue.id,
                organizerId: organizer.id,
                eventTags: {
                    create: finalTags.map((tag) => ({
                        tag: { connect: { id: tag.id } },
                    })),
                },
                ticketTypes: {
                    create: ticketTypesData,
                },
                eventSessions: {
                    create: [createSession(offset)],
                },
                eventSeatTier: isSeated
                    ? {
                          create: [
                              {
                                  tierNumber: 1,
                                  name: 'Main Hall',
                                  price: ticketTypesData[0].price + 100,
                                  color: '#4F46E5',
                                  numberOfRows: 8,
                                  numberOfColumns: 12,
                                  seats: {
                                      create: Array.from({ length: 96 }).map((_, idx) => ({
                                          rowIndex: Math.floor(idx / 12),
                                          seatIndex: idx % 12,
                                      })),
                                  },
                              },
                          ],
                      }
                    : undefined,
            },
        });
        events.push(event);

        if ((i + 1) % 50 === 0) console.log(`Events: Processed ${i + 1} records...`);
    }

    console.log('✅ Events seeded with logical dates and pricing.');
    return events;
}

export default seedEvents;
