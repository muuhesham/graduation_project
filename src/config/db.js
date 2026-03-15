import { PrismaClient } from '@prisma/client';
import { prismaMiddleware } from '../middlewares/prisma.js';

const basePrisma = new PrismaClient();
const prisma = prismaMiddleware(basePrisma);

async function connectDB() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

export { prisma, connectDB };
