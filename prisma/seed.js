import { prisma } from '../src/config/db.js';

//! Seeders
import seedUsers from './seeders/user.seeder.js';
import seedCategories from './seeders/category.seeder.js';
import seedGovernorates from './seeders/governorate.seeder.js';
import seedVenues from './seeders/venue.seeder.js';
import seedEvents from './seeders/event.seeder.js';
import seedOrganizers from './seeders/organizer.seeder.js';
import seedTags from './seeders/tag.seeder.js';

async function main() {
    console.log('🚀 Starting database seed...');
    await seedGovernorates(prisma); // this must be first, and must exist before any deployments
    await seedTags(prisma);
    // const users = await seedUsers(prisma);
    await seedCategories(prisma);
    // const venues = await seedVenues(prisma);
    // const organizers = await seedOrganizers(prisma, { users });
    // await seedEvents(prisma, { categories, venues, organizers });
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
    }
})();
