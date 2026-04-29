import { faker  } from '@faker-js/faker';

function organizerFactory(overrides = {}) {
    return {
        name: faker.person.fullName(),
        description: faker.lorem.paragraph(),
        contactEmail: faker.internet.email(),
        contactPhone: faker.phone.number(),
        type: faker.helpers.arrayElement(['HOBBYIST', 'BUSINESS', 'COMPANY']),
        ...overrides,
    };
}

export default organizerFactory;