//@ts-check

import countryFactory from '../factories/country.factory.js';
import stateFactory from '../factories/state.factory.js';
import cityFactory from '../factories/city.factory.js';

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export default async function seedLocations(prisma) {
    console.log('🌱 Seeding locations (Egypt only)...');

    const egypt = await prisma.country.create({
        data: countryFactory({
            name: 'Egypt',
            code: 'EG',
            phoneCode: '+20',
            currencyCode: 'EGP',
            currencySymbol: 'EGP',
            isSupported: true,
        }),
    });

    const governorates = await prisma.governorate.findMany();

    const states = [];
    const cities = [];

    for (const gov of governorates) {
        const state = await prisma.state.create({
            data: stateFactory({
                countryId: egypt.id,
                name: gov.name,
            }),
        });
        states.push(state);

        const city = await prisma.city.create({
            data: cityFactory({
                stateId: state.id,
                name: gov.name,
            }),
        });
        cities.push(city);
    }

    console.log(`✅ Locations seeded: 1 Country (Egypt), ${states.length} States, ${cities.length} Cities.`);
    return { countries: [egypt], states, cities };
}
