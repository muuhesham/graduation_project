//@ts-check

import { faker } from '@faker-js/faker';

function stateFactory(overrides = {}) {
    return {
        countryId: 1,
        name: faker.location.state(),
        ...overrides,
    };
}

export default stateFactory;
