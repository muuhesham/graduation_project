import organizerFactory from '../factories/organizer.factory.js';
import { faker } from '@faker-js/faker';
import OrganizerType from './../../src/constants/enums/organizerTypes.js';

async function seedOrganizers(prisma, { users }) {
    let organizers = [];
    
    // Filter users who should be organizers or just take the first N
    // To avoid unique constraint on userId, we only use each user once
    const maxOrganizers = Math.min(users.length, 50);
    console.log(`Seeding organizers: ${maxOrganizers} records...`);

    const countries = await prisma.country.findMany();
    const states = await prisma.state.findMany();
    const cities = await prisma.city.findMany();

    for (let i = 0; i < maxOrganizers; i++) {
        const user = users[i];
        if (user.email === 'user@fa3liat.com') continue; // Skip test user for upgrade testing
        
        const country = countries[Math.floor(Math.random() * countries.length)];
        const state = states.find(s => s.countryId === country.id) || states[0];
        const city = cities.find(c => c.stateId === state.id) || cities[0];

        const organizerData = organizerFactory();
        
        const typeData = {};
        if (organizerData.type === OrganizerType.HOBBYIST) {
            typeData.hobbyist = {
                create: { nationalId: faker.string.numeric(14) }
            };
        } else if (organizerData.type === OrganizerType.BUSINESS) {
            typeData.business = {
                create: { 
                    commercialRegistration: faker.string.alphanumeric(10),
                    taxId: faker.string.numeric(9)
                }
            };
        } else if (organizerData.type === OrganizerType.COMPANY) {
            typeData.company = {
                create: {
                    registrationNumber: faker.string.alphanumeric(10),
                    taxId: faker.string.numeric(9),
                    officialDocumentsDisk: 'local',
                    officialDocumentsPath: '/uploads/organizers/docs/default_registration.pdf'
                }
            };
        }

        try {
            const organizer = await prisma.organizer.create({
                data: {
                    ...organizerData,
                    userId: user.id,
                    countryId: country.id,
                    stateId: state.id,
                    cityId: city.id,
                    ...typeData
                },
            });
            organizers.push(organizer);
        } catch (error) {
            console.log(`⚠️ Failed to seed organizer for user ${user.id}: ${error.message}`);
        }
    }
    console.log(`✅ ${organizers.length} Organizers seeded.`);
    return organizers;
}

export default seedOrganizers;
