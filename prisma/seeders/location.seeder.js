//@ts-check

import { faker } from '@faker-js/faker';

import countryFactory from '../factories/country.factory.js';
import stateFactory from '../factories/state.factory.js';
import cityFactory from '../factories/city.factory.js';

const DEFAULTS = Object.freeze({
    countryCount: 10,
    statesPerCountry: 5,
    citiesPerState: 3,
});

/**
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
function toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * @param {number} count
 * @returns {{ code: string, name: string }[]}
 */
function buildCountriesSeed(count) {
    const results = [];
    const codes = new Set();
    const names = new Set();

    for (let i = 0; i < 2000 && results.length < count; i++) {
        const code = String(faker.location.countryCode('alpha-2') || '')
            .trim()
            .toUpperCase();
        const name = String(faker.location.country() || '').trim();

        if (!/^[A-Z]{2}$/.test(code)) continue;
        if (!name) continue;
        if (codes.has(code) || names.has(name)) continue;

        codes.add(code);
        names.add(name);
        results.push({ code, name });
    }

    if (results.length < count) {
        throw new Error(`Could not generate ${count} unique countries`);
    }

    return results;
}

/**
 * Seeds countries, states, and cities.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {{
 *  countryCount?: number,
 *  statesPerCountry?: number,
 *  citiesPerState?: number,
 * }} [options]
 */
export default async function seedLocations(prisma, options = {}) {
    const countryCount = toPositiveInt(options.countryCount, DEFAULTS.countryCount);
    const statesPerCountry = toPositiveInt(options.statesPerCountry, DEFAULTS.statesPerCountry);
    const citiesPerState = toPositiveInt(options.citiesPerState, DEFAULTS.citiesPerState);

    console.log('🌱 Seeding locations (countries, states, cities)...');

    await prisma.city.deleteMany();
    await prisma.state.deleteMany();
    await prisma.country.deleteMany();

    const countries = [];
    const states = [];
    const cities = [];
    const countrySeeds = buildCountriesSeed(countryCount);

    for (const seed of countrySeeds) {
        const country = await prisma.country.create({
            data: countryFactory({
                code: seed.code,
                name: seed.name,
                isSupported: true,
            }),
        });
        countries.push(country);

        for (let s = 0; s < statesPerCountry; s++) {
            const state = await prisma.state.create({
                data: stateFactory({
                    countryId: country.id,
                }),
            });
            states.push(state);

            for (let c = 0; c < citiesPerState; c++) {
                const city = await prisma.city.create({
                    data: cityFactory({
                        stateId: state.id,
                    }),
                });
                cities.push(city);
            }
        }
    }

    console.log('✅ Locations seeded.');
    return { countries, states, cities };
}
