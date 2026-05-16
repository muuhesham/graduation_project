import { faker } from '@faker-js/faker';

const categories = [
    'Technology', 'Music', 'Sports', 'Education', 'Business', 
    'Art & Culture', 'Food & Drink', 'Networking', 'Health', 'Travel'
];

function categoryFactory() {
    return {
        name: faker.helpers.arrayElement(categories),
        imagePath: faker.image.url({ category: 'nature' }),
    }
}

export default categoryFactory;
