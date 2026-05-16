import { faker } from '@faker-js/faker';
import PayoutStatus from './../../src/constants/enums/payoutStatus.js';

function payoutFactory(overrides = {}) {
    const startDate = faker.date.past();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week later

    return {
        amount: 0, // Should be calculated
        organizerCount: 0,
        orderCount: 0,
        startDate,
        endDate,
        status: faker.helpers.arrayElement(Object.values(PayoutStatus)),
        createdAt: new Date(),
        ...overrides,
    };
}

export default payoutFactory;

