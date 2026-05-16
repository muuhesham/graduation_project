import { faker } from '@faker-js/faker';

const egyptianVenues = [
    { name: 'Al-Manara Convention Center', city: 'New Cairo' },
    { name: 'Cairo Opera House', city: 'Zamalek' },
    { name: 'Bibliotheca Alexandrina', city: 'Alexandria' },
    { name: 'The GrEEK Campus', city: 'Cairo' },
    { name: 'Borg El Arab Stadium', city: 'Alexandria' },
    { name: 'International Exhibition Center', city: 'New Cairo' },
    { name: 'Cairo Stadium Indoor Hall', city: 'Nasr City' },
    { name: 'Gouna Convention Center', city: 'El Gouna' },
    { name: 'Baron Palace Gardens', city: 'Heliopolis' },
    { name: 'Tahrir Cultural Center (TCC)', city: 'Downtown Cairo' },
    { name: 'Gezira Sporting Club', city: 'Zamalek' },
    { name: 'Alexandria Stadium', city: 'Alexandria' }
];

function venueFactory(overrides = {}) {
    const venue = faker.helpers.arrayElement(egyptianVenues);
    
    return {
        name: venue.name,
        address: `${faker.location.streetAddress()}, ${venue.city}`,
        city: venue.city,
        googlePlaceId: `ChIJ${faker.string.alphanumeric(20)}`,
        country: 'Egypt',
        state: 'Egypt',
        zipCode: faker.location.zipCode('#####'),
        latitude: faker.location.latitude({ min: 22, max: 31 }),
        longitude: faker.location.longitude({ min: 25, max: 34 }),
        ...overrides
    };
}

export default venueFactory;
