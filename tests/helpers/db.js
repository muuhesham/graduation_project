import { prisma } from '../../src/config/db.js';

/**
 * Seeds a list of governorates for testing.
 */
export const seedGovernorates = async (names = ['CAIRO', 'ALEXANDRIA', 'GIZA']) => {
    const created = [];
    for (const name of names) {
        created.push(await prisma.governorate.upsert({
            where: { name },
            update: {},
            create: {
                name,
                latitude: 30,
                longitude: 31,
                otherGovsIdsSorted: []
            }
        }));
    }
    
    // Update them with IDs to avoid query issues in nearby events
    const allIds = created.map(g => g.id);
    for (const gov of created) {
        await prisma.governorate.update({
            where: { id: gov.id },
            data: { otherGovsIdsSorted: allIds }
        });
    }
    
    return created;
};

/**
 * Creates a test event for an organizer.
 */
export const createTestEvent = async (organizerId, categoryName = 'Technology') => {
    const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
            name: categoryName,
            imagePath: 'test.jpg',
        }
    });

    const [governorate] = await seedGovernorates(['CAIRO']);

    const venue = await prisma.venue.create({
        data: {
            name: 'Test Venue',
            address: 'Test Address',
            latitude: 30,
            longitude: 31,
            country: 'Egypt',
            state: 'Cairo',
            city: 'Cairo',
            governorateId: governorate.id
        }
    });

    const event = await prisma.event.create({
        data: {
            title: 'Test Event',
            description: 'Test Description',
            slug: `test-event-${Date.now()}-${Math.random()}`,
            organizerId,
            categoryId: category.id,
            venueId: venue.id,
            bannerPath: 'test-banner.jpg',
            type: 'ticketed',
            mode: 'single',
            eventSessions: {
                create: {
                    startDate: new Date(Date.now() + 86400000),
                    endDate: new Date(Date.now() + 172800000),
                }
            }
        }
    });

    return { event, category, venue };
};

/**
 * Creates a test ticket for a user.
 */
export const createTestTicket = async (userId, eventId) => {
    const ticketType = await prisma.ticketType.create({
        data: {
            eventId,
            name: 'Regular',
            price: 50,
            quantity: 100,
        }
    });

    const order = await prisma.order.create({
        data: {
            userId,
            totalPrice: 50,
            itemsCount: 1,
            status: 'completed',
            orderItems: {
                create: {
                    ticketTypeId: ticketType.id,
                    price: 50,
                    quantity: 1,
                }
            }
        },
        include: { orderItems: true }
    });

    const ticket = await prisma.ticket.create({
        data: {
            userId,
            ticketTypeId: ticketType.id,
            orderId: order.id,
            orderItemId: order.orderItems[0].id,
            status: 'valid',
        }
    });

    await prisma.qrCode.create({
        data: {
            ticketId: ticket.id,
            codePath: 'test-qr.png',
            status: 'valid'
        }
    });

    return { ticket, order, ticketType };
};
