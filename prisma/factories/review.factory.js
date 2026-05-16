import { faker } from '@faker-js/faker';

function reviewFactory(overrides = {}) {
    return {
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.paragraph(),
        createdAt: faker.date.recent({ days: 60 }),
        updatedAt: new Date(),
        ...overrides,
    };
}

export default reviewFactory;
