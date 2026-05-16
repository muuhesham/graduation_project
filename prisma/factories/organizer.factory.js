import { faker } from '@faker-js/faker';
import OrganizerType from './../../src/constants/enums/organizerTypes.js';

function organizerFactory(overrides = {}) {
    const name = faker.person.fullName();
    const slug = faker.helpers.slugify(name.toLowerCase());
    
    return {
        name,
        description: `${faker.company.catchPhrase()}. We are dedicated to providing world-class events in Egypt, focusing on ${faker.company.buzzPhrase()} to create unforgettable experiences for our attendees. Our team brings years of expertise in large-scale event management and cultural curation.`,
        contactEmail: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase().replace('@', `-${faker.string.alphanumeric(5)}@`),
        contactPhone: faker.phone.number().replace(/\D/g, '').slice(0, 10) + faker.string.numeric(5),
        type: faker.helpers.arrayElement(Object.values(OrganizerType)),
        logoPath: `https://i.pravatar.cc/300?u=${slug}`, // High quality avatar-style logo
        logoDisk: 'external',
        coverPath: `https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80`, // High quality crowd/event cover
        coverDisk: 'external',
        websiteUrl: faker.internet.url(),
        facebookUrl: `https://facebook.com/${slug}`,
        instagramUrl: `https://instagram.com/${slug}`,
        twitterUrl: `https://twitter.com/${slug}`,
        linkedinUrl: `https://linkedin.com/company/${slug}`,
        youtubeUrl: `https://youtube.com/@${slug}`,
        ...overrides,
    };
}

export default organizerFactory;
