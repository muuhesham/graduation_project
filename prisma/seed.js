import { prisma } from '../src/config/db.js';
import redisQueue from '../src/config/redis-queue.js';
import embeddingQueue from '../src/queues/embeddingQueue.js';

import seedUsers from './seeders/user.seeder.js';
import seedCategories from './seeders/category.seeder.js';
import seedGovernorates from './seeders/governorate.seeder.js';
import seedVenues from './seeders/venue.seeder.js';
import seedEvents from './seeders/event.seeder.js';
import seedOrganizers from './seeders/organizer.seeder.js';
import seedTags from './seeders/tag.seeder.js';
import seedLocations from './seeders/location.seeder.js';
import seedActivity from './seeders/activity.seeder.js';

async function clearDatabase() {
    console.log('🧹 Clearing database...');
    const tablenames = await prisma.$queryRaw`
        SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'
    `;

    for (const { tablename } of tablenames) {
        if (tablename !== '_prisma_migrations') {
            try {
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
            } catch (error) {
                console.log(`Could not truncate table ${tablename}: ${error.message}`);
            }
        }
    }
}

async function main() {
    console.log('🚀 Starting database seed...');
    
    await clearDatabase();

    await seedGovernorates(prisma); // this must be first, and must exist before any deployments
    await seedLocations(prisma);
    await seedTags(prisma);
    const users = await seedUsers(prisma);
    const categories = await seedCategories(prisma);
    const venues = await seedVenues(prisma);
    const organizers = await seedOrganizers(prisma, { users });
    const events = await seedEvents(prisma, { categories, venues, organizers });
    
    await seedActivity(prisma, { users, organizers, events, categories });

    console.log('🌱 All seeders completed.');
}

(async () => {
    try {
        await main();
    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await embeddingQueue.close();
        await redisQueue.quit();
    }
})();
