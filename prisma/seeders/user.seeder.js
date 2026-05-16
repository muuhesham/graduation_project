import userFactory from '../factories/user.factory.js';
import { hashPassword } from './../../src/utils/hash.js';

async function seedUsers(prisma) {
    let users = [];
    console.log('🌱 Seeding users...');

    // 1. Create a known Admin
    const adminPassword = await hashPassword('admin@123');
    await prisma.admin.upsert({
        where: { email: 'admin@fa3liat.com' },
        update: {},
        create: {
            name: 'System Admin',
            email: 'admin@fa3liat.com',
            password: adminPassword,
            isApproved: true,
        },
    });
    console.log('✅ Admin user created: admin@fa3liat.com / admin@123');

    // 2. Create a known Organizer
    const organizerUser = await prisma.user.upsert({
        where: { email: 'organizer@fa3liat.com' },
        update: {},
        create: {
            name: 'Event Organizer',
            email: 'organizer@fa3liat.com',
            password: await hashPassword('password@123'),
            role: 'organizer',
            isVerified: true,
            isCompleted: true,
        },
    });
    users.push(organizerUser);
    console.log('✅ Organizer user created: organizer@fa3liat.com / password@123');

    // 3. Create a known Regular User
    const regularUser = await prisma.user.upsert({
        where: { email: 'user@fa3liat.com' },
        update: {},
        create: {
            name: 'Regular Attendee',
            email: 'user@fa3liat.com',
            password: await hashPassword('password@123'),
            role: 'user',
            isVerified: true,
            isCompleted: true,
        },
    });
    users.push(regularUser);
    console.log('✅ Regular user created: user@fa3liat.com / password@123');

    // 4. Create random users
    for (let i = 0; i < 10; i++) {
        const data = await userFactory();
        const user = await prisma.user.create({
            data: data,
        });
        users.push(user);
    }
    console.log(`✅ ${users.length} Users seeded in total.`);
    return users;
}

export default seedUsers;
