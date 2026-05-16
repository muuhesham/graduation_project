import request from 'supertest';
import app from '../src/app.js';
import { clearDatabase } from './setup.js';
import { createTestOrganizer, createTestUser } from './helpers/auth.js';
import { createTestEvent, createTestTicket } from './helpers/db.js';
import TicketStatus from '../src/constants/enums/ticketStatus.js';

describe('Mobile API (Scanning)', () => {
    let organizerToken;
    let organizerRecord;
    let attendeeUser;
    let validTicket;

    beforeEach(async () => {
        await clearDatabase();
        
        // Setup Organizer
        const setup = await createTestOrganizer();
        organizerToken = setup.token;
        organizerRecord = setup.organizer;

        // Setup Event
        const { event } = await createTestEvent(organizerRecord.id);

        // Setup Attendee and Ticket
        const { user } = await createTestUser();
        attendeeUser = user;
        const ticketSetup = await createTestTicket(attendeeUser.id, event.id);
        validTicket = ticketSetup.ticket;
    });

    describe('POST /api/v1/mobile/scan', () => {
        it('should scan a valid ticket successfully', async () => {
            const res = await request(app)
                .post('/api/v1/mobile/scan')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ ticketId: validTicket.id });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.message).toContain('scanned successfully');
            expect(res.body.data.status).toBe(TicketStatus.USED);
        });

        it('should fail when scanning an already used ticket', async () => {
            // First scan
            await request(app)
                .post('/api/v1/mobile/scan')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ ticketId: validTicket.id });

            // Second scan
            const res = await request(app)
                .post('/api/v1/mobile/scan')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ ticketId: validTicket.id });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe('fail');
            expect(res.body.data.message).toContain('already been used');
        });

        it('should fail when organizer scans a ticket for an event they do not own', async () => {
            // Create another organizer
            const otherSetup = await createTestOrganizer();
            
            const res = await request(app)
                .post('/api/v1/mobile/scan')
                .set('Authorization', `Bearer ${otherSetup.token}`)
                .send({ ticketId: validTicket.id });

            expect(res.status).toBe(403);
            expect(res.body.status).toBe('fail');
            expect(res.body.data.message).toContain('Unauthorized');
        });

        it('should fail with invalid ticket ID format', async () => {
            const res = await request(app)
                .post('/api/v1/mobile/scan')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ ticketId: 'not-a-uuid' });

            expect(res.status).toBe(422);
            expect(res.body.status).toBe('fail');
        });
    });
});
