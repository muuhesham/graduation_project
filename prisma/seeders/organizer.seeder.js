import organizerFactory from '../factories/organizer.factory.js';

async function seedOrganizers(prisma, { users }) {
    let organizers = [];
    console.log('🌱 Seeding organizers...');

    const countries = await prisma.country.findMany();
    const states = await prisma.state.findMany();
    const cities = await prisma.city.findMany();

    for (let i = 0; i < 5; i++) {
        const user = users[i % users.length];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const state = states.find(s => s.countryId === country.id) || states[0];
        const city = cities.find(c => s => s.stateId === state.id) || cities[0];

        const organizer = await prisma.organizer.create({
            data: {
                ...organizerFactory(),
                userId: user.id,
                countryId: country.id,
                stateId: state.id,
                cityId: city.id,
            },
        });
        organizers.push(organizer);
    }
    console.log('✅ Organizers seeded.');
    return organizers;
}

export default seedOrganizers;