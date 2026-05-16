import { faker } from '@faker-js/faker';
import adminFactory from '../factories/admin.factory.js';
import orderFactory from '../factories/order.factory.js';
import ticketFactory from '../factories/ticket.factory.js';
import reviewFactory from '../factories/review.factory.js';
import payoutFactory from '../factories/payout.factory.js';
import OrderStatus from './../../src/constants/enums/orderStatus.js';
import TicketStatus from './../../src/constants/enums/ticketStatus.js';
import PayoutStatus from './../../src/constants/enums/payoutStatus.js';
import PayoutItemStatus from './../../src/constants/enums/payoutItemStatus.js';
import { QRCodeStatus } from './../../src/constants/enums/qrcodeStatus.js';
import { addEmbeddingJob, EmbeddingJobType } from '../../src/queues/embeddingQueue.js';
import { OLLAMA_BASE_URL } from '../../src/config/env.js';

export default async function seedActivity(prisma, { users, organizers, events }) {
    console.log('Seeding activity: Orders, Payouts, Indexing...');
    
    const admins = [];
    for (let i = 0; i < 3; i++) {
        admins.push(await prisma.admin.create({ data: await adminFactory() }));
    }

    for (const user of users) {
        const following = faker.helpers.arrayElements(organizers, faker.number.int({ min: 1, max: 3 }));
        for (const org of following) {
            await prisma.organizerFollower.upsert({
                where: { userId_organizerId: { userId: user.id, organizerId: org.id } },
                update: {},
                create: { userId: user.id, organizerId: org.id }
            });
        }
        
        const interests = faker.helpers.arrayElements(events, faker.number.int({ min: 2, max: 8 }));
        for (const event of interests) {
            await prisma.interestedEvent.upsert({
                where: { userId_eventId: { userId: user.id, eventId: event.id } },
                update: {},
                create: { userId: user.id, eventId: event.id }
            });
        }
    }

    const activeEvents = events.filter(e => e.status !== 'cancelled');
    for (const event of activeEvents) {
        const tier = Math.random();
        let salesCount = 0;
        if (tier > 0.95) salesCount = faker.number.int({ min: 20, max: 40 }); 
        else if (tier > 0.70) salesCount = faker.number.int({ min: 5, max: 15 }); 
        else if (tier > 0.30) salesCount = faker.number.int({ min: 1, max: 4 });  
        
        if (salesCount === 0) continue;

        const ticketTypes = await prisma.ticketType.findMany({ where: { eventId: event.id } });
        if (!ticketTypes.length) continue;

        for (let i = 0; i < salesCount; i++) {
            const buyer = faker.helpers.arrayElement(users);
            const type = faker.helpers.arrayElement(ticketTypes);
            const qty = faker.number.int({ min: 1, max: 3 });
            const total = Number(type.price) * qty;

            const order = await prisma.order.create({
                data: {
                    ...orderFactory({
                        userId: buyer.id,
                        totalPrice: total,
                        itemsCount: qty,
                        status: OrderStatus.COMPLETED,
                    }),
                    orderItems: {
                        create: { ticketTypeId: type.id, price: type.price, quantity: qty }
                    }
                },
                include: { orderItems: true }
            });

            for (let j = 0; j < qty; j++) {
                const ticket = await prisma.ticket.create({
                    data: ticketFactory({
                        userId: buyer.id,
                        ticketTypeId: type.id,
                        orderId: order.id,
                        orderItemId: order.orderItems[0].id,
                        status: TicketStatus.VALID
                    })
                });

                await prisma.qrCode.create({
                    data: {
                        ticketId: ticket.id,
                        codePath: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${ticket.id}`,
                        codeDisk: 'external',
                        status: QRCodeStatus.VALID
                    }
                });
            }
        }

        const reviewsCount = Math.floor(salesCount / 2) + 1;
        const reviewers = faker.helpers.arrayElements(users, Math.min(reviewsCount, 5));
        for (const reviewer of reviewers) {
            await prisma.eventReview.upsert({
                where: { userId_eventId: { userId: reviewer.id, eventId: event.id } },
                update: {},
                create: reviewFactory({ userId: reviewer.id, eventId: event.id })
            });
        }
    }

    const adminId = admins[0].id;
    for (const org of organizers) {
        const completedOrders = await prisma.order.findMany({
            where: {
                status: OrderStatus.COMPLETED,
                isPaidOut: false,
                tickets: { some: { ticketType: { event: { organizerId: org.id } } } }
            }
        });

        if (completedOrders.length > 5) { 
            const total = completedOrders.reduce((s, o) => s + Number(o.totalPrice), 0);
            const payout = await prisma.payout.create({
                data: payoutFactory({
                    adminId,
                    amount: total,
                    organizerCount: 1,
                    orderCount: completedOrders.length,
                    status: PayoutStatus.COMPLETED,
                    startDate: faker.date.past(),
                    endDate: new Date(),
                    items: {
                        create: { organizerId: org.id, amount: total, status: PayoutItemStatus.PAID }
                    }
                })
            });

            await prisma.order.updateMany({
                where: { id: { in: completedOrders.map(o => o.id) } },
                data: { isPaidOut: true, payoutId: payout.id }
            });
        }
    }

    let aiOnline = false;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const resp = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
        aiOnline = resp.ok;
        clearTimeout(timeoutId);
    } catch {
        aiOnline = false;
    }

    if (aiOnline) {
        const toIndex = events.slice(0, 300);
        console.log(`Search Index: Queueing ${toIndex.length} background jobs...`);
        for (const event of toIndex) {
            await addEmbeddingJob(EmbeddingJobType.GENERATE_EMBEDDING, String(event.id)).catch(err => {
                console.warn(`Search Index: Failed to queue event ${event.id}: ${err.message}`);
            });
        }
    } else {
        console.log('Search Index: AI Service offline (Queueing skipped).');
    }
}
