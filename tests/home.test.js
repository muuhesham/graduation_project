import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { clearDatabase } from './setup.js';
import { createTestUser } from './helpers/auth.js';
import { seedGovernorates } from './helpers/db.js';

describe('Home API - Nearby Events', () => {
    beforeEach(async () => {
        await clearDatabase();
    });

    test('GET /home/nearby-events - returns empty array when no governorates exist', async () => {
        const res = await request(app).get('/api/v1/home/nearby-events');
        
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.events).toEqual([]);
    });

    test('GET /home/nearby-events - does not crash when CAIRO is missing but other governorates exist', async () => {
        // Seed some governorates except CAIRO
        await seedGovernorates(['ALEXANDRIA', 'GIZA']);

        const res = await request(app).get('/api/v1/home/nearby-events');
        
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.events).toBeInstanceOf(Array);
    });

    test('GET /home/nearby-events - works for guest user with CAIRO present (Happy Path)', async () => {
        await seedGovernorates(['CAIRO', 'ALEXANDRIA']);

        const res = await request(app).get('/api/v1/home/nearby-events');
        
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.events).toBeInstanceOf(Array);
    });
});
