import { faker } from '@faker-js/faker';
import OrderStatus from './../../src/constants/enums/orderStatus.js';

function orderFactory(overrides = {}) {
    return {
        totalPrice: 0, // Should be calculated based on items
        itemsCount: 0,
        status: faker.helpers.arrayElement(Object.values(OrderStatus)),
        createdAt: faker.date.recent({ days: 30 }),
        updatedAt: new Date(),
        isPaidOut: false,
        ...overrides,
    };
}

export default orderFactory;
