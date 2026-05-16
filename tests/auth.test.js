import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase } from './setup.js';

describe('Auth API', () => {
    beforeEach(async () => {
        await clearDatabase();
    });

    describe('POST /api/v1/auth/register', () => {
        const validUser = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password@12345',
        };

        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(validUser);

            expect(res.status).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data).toHaveProperty('refreshToken');
        });

        it('should fail with invalid email format', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ ...validUser, email: 'invalid-email' });

            expect(res.status).toBe(422);
            expect(res.body.status).toBe('fail');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        const validUser = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password@12345',
        };

        beforeEach(async () => {
            await request(app).post('/api/v1/auth/register').send(validUser);
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: validUser.email,
                    password: validUser.password,
                });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data).toHaveProperty('refreshToken');
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: validUser.email,
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe('fail');
        });
    });
});
