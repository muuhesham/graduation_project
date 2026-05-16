import { faker } from '@faker-js/faker';
import TicketStatus from './../../src/constants/enums/ticketStatus.js';

function ticketFactory(overrides = {}) {
    return {
        status: faker.helpers.arrayElement(Object.values(TicketStatus)),
        createdAt: faker.date.recent({ days: 30 }),
        updatedAt: new Date(),
        ...overrides,
    };
}

export default ticketFactory;
