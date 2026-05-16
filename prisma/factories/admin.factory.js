import { faker } from '@faker-js/faker';
import { hashPassword } from './../../src/utils/hash.js';

const PASSWORD = 'password@12345';

async function adminFactory(overrides = {}) {
    const name = faker.person.fullName();
    return {
        name,
        email: faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] }).toLowerCase().replace('@', `-admin-${faker.string.alphanumeric(5)}@`),
        password: await hashPassword(PASSWORD),
        isApproved: true,
        ...overrides,
    };
}

export default adminFactory;
