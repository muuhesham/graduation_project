import { faker } from '@faker-js/faker';

const fixedCategories = [
    { name: 'Technology', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
    { name: 'Music', image: 'https://images.unsplash.com/photo-1514525253361-bee8718a342b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80' },
    { name: 'Education', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80' },
    { name: 'Business', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' },
    { name: 'Art & Culture', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Food & Drink', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
    { name: 'Networking', image: 'https://images.unsplash.com/photo-1528605248644-14dd04cb11c1?auto=format&fit=crop&w=800&q=80' },
    { name: 'Health', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' },
    { name: 'Travel', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80' }
];

async function categorySeeder(prisma) {
    let categories = [];
    console.log('Seeding high-quality curated categories...');
    
    for (const cat of fixedCategories) {
        const fileName = `categories/${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}.jpg`;
        const category = await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: {
                name: cat.name,
                imagePath: fileName,
                imageDisk: 'local'
            },
        });
        categories.push(category);
    }
    
    console.log('Categories seeded.');
    return categories;
}

export default categorySeeder;
