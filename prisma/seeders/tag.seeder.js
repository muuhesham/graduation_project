import tagFactory from "../factories/tag.factory.js";

async function seedTags(prisma) {
    let tags = [];
    console.log('Seeding tags...');
    for (let i = 0; i <= 20; i++) {
        const data = tagFactory();
        const normalizeData = data.name.toLowerCase();

        const tag = await prisma.tag.upsert({
            where: { name: normalizeData },
            update: {},
            create: { name: normalizeData },
        });
        
        tags.push(tag);
    }
    console.log('Finished seeding tags.');
}

export default seedTags;