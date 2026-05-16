import { prisma } from '../src/config/db.js';
import redisQueue from '../src/config/redis-queue.js';
import { redis } from '../src/config/redis.js';

beforeAll(async () => {
  // Ensure we are connected
  await prisma.$connect();
});

afterAll(async () => {
  await Promise.all([
    prisma.$disconnect(),
    redisQueue.quit(),
    redis.quit()
  ]);
});

/**
 * Clears all tables in the database.
 * Useful for resetting state between tests.
 */
export const clearDatabase = async () => {
    const tablenames = await prisma.$queryRaw`
        SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');

    if (tables.length > 0) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
};
