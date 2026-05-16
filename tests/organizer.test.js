import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase } from './setup.js';
import { createTestOrganizer } from './helpers/auth.js';
import { prisma } from '../src/config/db.js';

describe('Organizer API', () => {
    let organizerToken;
    let organizerUser;

    beforeEach(async () => {
        await clearDatabase();
        const setup = await createTestOrganizer();
        organizerToken = setup.token;
        organizerUser = setup.user;

        // Create a category
        await prisma.category.upsert({
            where: { name: 'Technology' },
            update: {},
            create: {
                name: 'Technology',
                imagePath: 'tech.jpg',
                imageDisk: 'local',
            }
        });
    });

    describe('POST /api/v1/organizer/events', () => {
        it('should create a new event successfully', async () => {
            const eventData = {
                title: 'Tech Summit 2026',
                description: 'The biggest tech event in Cairo.',
                categoryName: 'Technology',
                type: 'free',
                mode: 'single',
                sessions: JSON.stringify([{
                    startDate: new Date(Date.now() + 86400000).toISOString(),
                    endDate: new Date(Date.now() + 172800000).toISOString()
                }]),
                location: JSON.stringify({
                    name: 'Cairo Stadium',
                    address: 'Nasr City',
                    latitude: 30.01,
                    longitude: 31.23,
                    country: 'Egypt',
                    state: 'Cairo',
                    city: 'Cairo'
                }),
                tickets: JSON.stringify([
                    { name: 'Regular', price: 0, quantity: 100 }
                ])
            };

            const res = await request(app)
                .post('/api/v1/organizer/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .field(eventData)
                .attach('banner', Buffer.from('dummy-image-content'), {
                    filename: 'banner.png',
                    contentType: 'image/png'
                });

            if (res.status === 500) {
                console.error('500 Error Response:', JSON.stringify(res.body, null, 2));
            }

            expect(res.status).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('id');
        });

        it('should fail to create event without banner', async () => {
            const res = await request(app)
                .post('/api/v1/organizer/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .set('Content-Type', 'multipart/form-data') // Ensure we match multipart
                .field('title', 'No Banner Event');

            expect(res.status).toBe(422);
            expect(res.body.status).toBe('fail');
        });

        it('should fail for non-organizer user', async () => {
            const { token: userToken } = await import('./helpers/auth.js').then(h => h.createTestUser());
            
            const res = await request(app)
                .post('/api/v1/organizer/events')
                .set('Authorization', `Bearer ${userToken}`)
                .set('Content-Type', 'multipart/form-data'); // Pass multipart check

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/v1/organizer/events', () => {
        it('should list organizer events', async () => {
            const res = await request(app)
                .get('/api/v1/organizer/events')
                .set('Authorization', `Bearer ${organizerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data.events)).toBe(true);
        });
    });
});
