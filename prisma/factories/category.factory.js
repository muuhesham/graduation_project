import { faker } from '@faker-js/faker';
function categoryFactory() {
    return {
        name: `${faker.commerce.department()}-${faker.string.alphanumeric(3)}`,
        imagePath: faker.image.url(),
    }
}
export default categoryFactory;