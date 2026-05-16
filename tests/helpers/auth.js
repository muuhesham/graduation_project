import jwt from 'jsonwebtoken';
import { JWT_KEY } from '../../src/config/env.js';
import { prisma } from '../../src/config/db.js';
import { hashPassword } from '../../src/utils/hash.js';
import UserRoles from '../../src/constants/enums/userRoles.js';

/**
 * Generates an access token for a given user.
 */
export const generateToken = (user) => {
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, JWT_KEY, { expiresIn: '1h' });
};

/**
 * Creates a test user with a specific role and returns the user and their token.
 */
export const createTestUser = async (role = UserRoles.USER) => {
    const email = `test-${role}-${Date.now()}@example.com`;
    const user = await prisma.user.create({
        data: {
            name: 'Test User',
            email,
            password: await hashPassword('password@12345'),
            role,
            isVerified: true,
        },
    });

    const token = generateToken(user);
    return { user, token };
};

/**
 * Creates a test organizer (User + Organizer record).
 */
export const createTestOrganizer = async () => {
    const { user, token } = await createTestUser(UserRoles.ORGANIZER);
    
    const country = await prisma.country.upsert({
        where: { code: 'EG' },
        update: {},
        create: {
            name: 'Egypt',
            code: 'EG',
            phoneCode: '20',
            currencyCode: 'EGP',
            currencySymbol: '£',
            flagEmoji: '🇪🇬',
        }
    });

    const governorate = await prisma.governorate.upsert({
        where: { name: 'CAIRO' },
        update: {},
        create: {
            name: 'CAIRO',
            latitude: 30.033333,
            longitude: 31.233334,
            otherGovsIdsSorted: []
        }
    });
    
    await prisma.governorate.update({
        where: { id: governorate.id },
        data: { otherGovsIdsSorted: [governorate.id] }
    });

    const state = await prisma.state.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Cairo',
            countryId: country.id,
        }
    });

    const city = await prisma.city.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Cairo',
            stateId: state.id,
        }
    });

    const organizer = await prisma.organizer.create({
        data: {
            userId: user.id,
            name: 'Test Organizer',
            contactEmail: user.email,
            contactPhone: `+201${Math.floor(Math.random() * 1000000000)}`,
            cityId: city.id,
            countryId: country.id,
            stateId: state.id,
            type: 'HOBBYIST',
            verificationStatus: 'APPROVED',
            isContactEmailVerified: true
        },
    });

    return { user, organizer, token };
};
