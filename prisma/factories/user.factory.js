import { faker } from '@faker-js/faker';
import { hashPassword } from './../../src/utils/hash.js';
import Gender from './../../src/constants/enums/userGender.js';

const PASSWORD = 'password@12345';

const egyptianFirstNames = [
    'Ahmed', 'Mohamed', 'Mahmoud', 'Mustafa', 'Youssef', 'Ibrahim', 'Tarek', 'Omar', 'Ali', 'Khaled',
    'Sara', 'Mona', 'Nour', 'Layla', 'Hana', 'Mariam', 'Yasmin', 'Dina', 'Fatma', 'Aya'
];

const egyptianLastNames = [
    'Hassan', 'Mansour', 'Abdelaziz', 'Soliman', 'El-Sayed', 'Mostafa', 'Gaber', 'Ezzat', 'Fawzy', 'Khalil'
];

async function userFactory(overrides = {}) {
    const firstName = faker.helpers.arrayElement(egyptianFirstNames);
    const lastName = faker.helpers.arrayElement(egyptianLastNames);
    const fullName = `${firstName} ${lastName}`;
    
    return {
        name: fullName,
        email: faker.internet.email({ firstName: firstName.toLowerCase(), lastName: lastName.toLowerCase() }).toLowerCase().replace('@', `-${faker.string.alphanumeric(5)}@`),
        password: await hashPassword(PASSWORD),
        gender: faker.helpers.arrayElement(Object.values(Gender)),
        ...overrides
    };
}

export default userFactory;
