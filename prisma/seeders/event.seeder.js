import eventFactory, { egyptianScenarios } from '../factories/event.factory.js';
import SessionStatus from './../../src/constants/enums/sessionStatus.js';
import EventStatus from './../../src/constants/enums/eventStatus.js';
import { faker } from '@faker-js/faker';

async function seedEvents(prisma, { categories, venues, organizers }) {
    let events = [];
    console.log('Seeding events: 500 records...');

    const tags = await prisma.tag.findMany();

    const createSession = (status = SessionStatus.ACTIVE, offsetDays = 0) => {
        const start = new Date();
        start.setDate(start.getDate() + offsetDays);
        start.setHours(faker.number.int({ min: 9, max: 20 }), 0, 0, 0);

        const end = new Date(start);
        end.setHours(end.getHours() + faker.number.int({ min: 2, max: 6 }));

        return { startDate: start, endDate: end, status };
    };

    if (!categories.length || !venues.length || !organizers.length) {
        console.log('⚠️ Skipping events seeding: missing related data.');
        return [];
    }

    for (let i = 0; i < 500; i++) {
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

        let status = EventStatus.ACTIVE;
        let offset = faker.number.int({ min: -30, max: 365 });

        const rand = Math.random();
        if (rand > 0.9) status = EventStatus.CANCELLED;
        else if (offset < 0) status = EventStatus.ACTIVE;

        const baseData = eventFactory({
            title: `${scenario.topic} ${faker.number.int({ min: 2025, max: 2027 })}`,
            description: scenario.description,
            categoryId: category.id,
            status: status,
        });

        delete baseData._scenario;

        const isSeated = Math.random() > 0.8;

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
                    create: [
                        {
                            name: 'Standard',
                            price: faker.number.int({ min: 100, max: 500 }),
                            quantity: 200,
                        },
                        {
                            name: 'VIP',
                            price: faker.number.int({ min: 800, max: 2500 }),
                            quantity: 50,
                        },
                    ],
                },
                eventSessions: {
                    create: [createSession(SessionStatus.ACTIVE, offset)],
                },
                eventSeatTier: isSeated
                    ? {
                          create: [
                              {
                                  tierNumber: 1,
                                  name: 'Premium Row',
                                  price: 1500,
                                  color: '#4F46E5',
                                  numberOfRows: 5,
                                  numberOfColumns: 10,
                                  seats: {
                                      create: Array.from({ length: 50 }).map((_, idx) => ({
                                          rowIndex: Math.floor(idx / 10),
                                          seatIndex: idx % 10,
                                      })),
                                  },
                              },
                          ],
                      }
                    : undefined,
            },
        });
        events.push(event);

        if ((i + 1) % 100 === 0) console.log(`Events: Processed ${i + 1} records...`);
    }

    console.log('✅ Events seeded.');
    return events;
}

export default seedEvents;
