import { Server } from 'socket.io';
import { prisma as prismaClient } from '../config/db.js';
import chatbotService from '../services/chatbotService.js';
import { validateChat } from '../validations/chatbotValidtion.js';
import { socketAuth } from '../middlewares/socketauth.js';
import { chatLimiter } from '../middlewares/rateLimiter.js';

export function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Authorization'],
            credentials: true,
        },
    });

    io.use(socketAuth);

    io.on('connection', async(socket) => {
        console.log('🟢 Client connected:', socket.id);
        console.log('User ID:', socket.userId);

        // ===== NOTIFICATION ROOMS =====
        // Join user notification room
        socket.join(`user-${socket.userId}`);
        console.log(`Socket ${socket.id} joined user-${socket.userId}`);

        const organizer = await prismaClient.organizer.findUnique({
        where: { userId: socket.userId },
        select: { id: true },
        });

        if(organizer) {
            // join organizer notification room
                socket.join(`organizer-${organizer.id}`);
                console.log(`Socket ${socket.id} joined organizer-${organizer.id}`);
        }

        // ===== EVENT ROOMS =====
        socket.on('join-event', (eventId) => {
            socket.join(`event-${eventId}`);
            console.log(`📌 Socket ${socket.id} joined event-${eventId}`);
        });

        socket.on('leave-event', (eventId) => {
            socket.leave(`event-${eventId}`);
            console.log(`Socket ${socket.id} left event-${eventId}`);
        });

        // ===== CHATBOT FUNCTIONALITY =====
        // chatbot room
        socket.on('chatbot-message', async (data) => {
            const { message } = data;
            const userId = socket.userId;

            try {
                validateChat({ message, socket });
                socket.emit('chatbot-reply', { isTyping: true });
                const response = await chatbotService.handleChat({ message, userId });
                socket.emit('chatbot-reply', {
                    message: response,
                    timeStamp: new Date().toISOString(),
                });
            } catch (err) {
                console.error('Chatbot Error:', err);
                socket.emit('chatbot-reply', {
                    text: 'sorry, there was an error processing your request. Please try again later.',
                });
            } finally {
                socket.emit('chatbot-reply', { isTyping: false });
            }
        });

        socket.on('disconnect', () => {
            console.log('🔴 Client disconnected:', socket.id);
        });
    });

    return io;
}
