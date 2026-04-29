import { faker } from '@faker-js/faker';
import EventType from './../../src/constants/enums/eventType.js';
import EventMode from './../../src/constants/enums/eventMode.js';

function eventFactory(overrides = {}) {
    const eventTypes = Object.values(EventType);
    const eventModes = Object.values(EventMode);
    const title = faker.lorem.words({ min: 3, max: 7 });

    return {
        title,
        slug: faker.helpers.slugify(title.toLowerCase()) + '-' + faker.string.alphanumeric(5),
        description: faker.lorem.paragraphs({ min: 1, max: 3 }),
        type: faker.helpers.arrayElement(eventTypes),
        mode: faker.helpers.arrayElement(eventModes),
        bannerPath: `/uploads/events/default.jpg`, // Using a standard local path as requested
        bannerDisk: 'local',
        ...overrides,
    };
}

export default eventFactory;