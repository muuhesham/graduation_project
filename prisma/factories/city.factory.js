//@ts-check

import { faker } from '@faker-js/faker';

function cityFactory(overrides = {}) {
    return {
        stateId: 1,
        name: faker.location.city(),
        ...overrides,
    };
}

export default cityFactory;
