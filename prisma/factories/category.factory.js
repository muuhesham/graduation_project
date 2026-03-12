import { faker } from '@faker-js/faker';
function categoryFactory() {
    return {
        name: faker.helpers.unique(faker.commerce.department),
    };
}
export default categoryFactory;