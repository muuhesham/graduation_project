import { faker } from '@faker-js/faker';
import EventStatus from './../../src/constants/enums/eventStatus.js';
import EventType from './../../src/constants/enums/eventType.js';
import EventMode from './../../src/constants/enums/eventMode.js';

const egyptianScenarios = [
    {
        topic: 'RiseUp Tech Summit',
        category: 'Technology',
        description:
            'The leading tech and entrepreneurship event in the MENA region. Join thousands of founders, investors, and tech enthusiasts at the GrEEK Campus for three days of networking, pitches, and innovation keynotes. Explore the latest in AI, Fintech, and Green Tech within the vibrant Egyptian ecosystem.',
        tags: ['Entrepreneurship', 'Startups', 'Venture Capital', 'Innovation', 'Technology'],
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Cairo Jazz Festival',
        category: 'Music',
        description:
            'An annual celebration of jazz music featuring international and local artists. Experience the rhythm of the city at Cairo Opera House with performances ranging from classic swing to modern fusion. A cultural bridge connecting the heart of Cairo with global musical influences.',
        tags: ['Live Music', 'Jazz', 'Cultural Event', 'Art', 'Entertainment'],
        image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Pyramids Half Marathon',
        category: 'Sports',
        description:
            'Run through history. A world-class running event taking place at the Giza Pyramids Plateau. Choose between 5K, 10K, or 21K while enjoying the majestic view of the Great Pyramids. Join thousands of athletes in this once-in-a-lifetime endurance challenge.',
        tags: ['Fitness', 'Running', 'Athletics', 'Historical', 'Outdoor'],
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Web3 & Blockchain Cairo',
        category: 'Technology',
        description:
            'Exploring the future of decentralized finance and digital assets in Egypt. Featuring keynote speakers from top global exchanges and workshops on smart contracts and NFTs. Understand how blockchain is reshaping the financial landscape of the Middle East.',
        tags: ['Blockchain', 'Crypto', 'Web3', 'Finance', 'FinTech'],
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Alexandria Film Festival',
        category: 'Art & Culture',
        description:
            'A prestigious cinematic event showcasing Mediterranean films and documentaries. Join us for screenings, workshops, and panel discussions at the Bibliotheca Alexandrina. Celebrating the art of storytelling and the diversity of Mediterranean cultures.',
        tags: ['Cinema', 'Filmmaking', 'Mediterranean', 'Awards', 'Culture'],
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Marketing & Digital Growth Expo',
        category: 'Business',
        description:
            'Learn the latest trends in SEO, social media, and AI-driven marketing from the best in the industry. Perfect for small business owners and CMOs looking to scale their operations in the digital-first economy of 2026.',
        tags: ['Marketing', 'SEO', 'Business Growth', 'Social Media', 'Advertising'],
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Zamalek Art Walk',
        category: 'Art & Culture',
        description:
            'A community-driven art gallery tour across Zamalek island. Discover local contemporary artists and sculptors in a series of open-house events across several historical villas. Experience the artistic soul of Cairo through its most creative neighborhood.',
        tags: ['Art', 'Gallery', 'Walking Tour', 'Community', 'Exhibition'],
        image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'MENA Health & Wellness Expo',
        category: 'Health',
        description:
            'The biggest health event of the year. Yoga workshops, nutrition seminars, and latest fitness technology all under one roof at the Cairo International Convention Centre. Dedicated to improving holistic well-being and promoting healthy lifestyles in the region.',
        tags: ['Yoga', 'Mental Health', 'Wellness', 'Fitness', 'Lifestyle'],
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Egyptian Food Festival',
        category: 'Food & Drink',
        description:
            'Satisfy your hunger and taste the flavors of Egypt from traditional Koshary to modern fusion. Live cooking shows by celebrity chefs and a huge street food market celebrating Egypt culinary heritage. A perfect dining experience for food lovers.',
        tags: ['Foodie', 'Cooking', 'Culinary', 'Street Food', 'Dining'],
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Cairo Comic Con',
        category: 'Entertainment',
        description:
            'The ultimate pop culture celebration in Egypt. Cosplay competitions, artist alleys, and exclusive merch from your favorite movies and anime. A vibrant gathering for geeks, gamers, and artists from all over the country.',
        tags: ['Cosplay', 'Gaming', 'Anime', 'Pop Culture', 'Geek'],
        image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Global Education Forum',
        category: 'Education',
        description:
            'Connecting students with top universities worldwide. Information sessions on scholarships, study abroad programs, and career counseling. Empowering the next generation of Egyptian leaders through international education opportunities.',
        tags: ['University', 'Scholarships', 'Learning', 'Career', 'Students'],
        image: 'https://images.unsplash.com/photo-1523050335456-adeba8845d2d?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Startup Investment Night',
        category: 'Business',
        description:
            'An exclusive networking event for angel investors and high-growth startups. Pitches, dinner, and strategic partnership discussions in a high-stakes environment designed to fuel the Egyptian startup engine.',
        tags: ['Networking', 'Investment', 'Funding', 'Business', 'Equity'],
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Luxor Ancient Egypt Workshop',
        category: 'Travel',
        description:
            'An immersive historical experience in the heart of Luxor. Guided tours by archeologists and workshops on hieroglyphics and ancient craft. Step back in time and discover the secrets of the Pharaohs in their eternal city.',
        tags: ['History', 'Tourism', 'Archaeology', 'Travel', 'Egyptology'],
        image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Red Sea Diving Championship',
        category: 'Sports',
        description:
            'International diving competition in Hurghada. Spectacular underwater displays and workshops on marine conservation. Experience the breathtaking beauty of the Red Sea coral reefs and its diverse marine life.',
        tags: ['Diving', 'Marine Life', 'Red Sea', 'Competition', 'Water Sports'],
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Cairo Design Week',
        category: 'Art & Culture',
        description:
            'Celebrating the best of Egyptian design across fashion, architecture, and interior design. Exhibitions and talks by industry leaders highlighting the unique blend of traditional craftsmanship and modern aesthetics.',
        tags: ['Design', 'Architecture', 'Fashion', 'Creativity', 'Interior'],
        image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Gouna Film Festival',
        category: 'Art & Culture',
        description:
            'A world-class film festival set against the stunning backdrop of El Gouna. Bringing together cinema legends and emerging talent for a week of premieres, red carpets, and cinematic excellence in the heart of the Red Sea.',
        tags: ['Cinema', 'Red Carpet', 'Celebrity', 'Premiere', 'Culture'],
        image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Nile Felucca Music Series',
        category: 'Music',
        description:
            'Intimate acoustic performances on traditional sailboats gliding down the Nile at sunset. Experience local indie folk and traditional melodies in the most iconic setting Cairo has to offer.',
        tags: ['Indie', 'Acoustic', 'Nile', 'Sunset', 'Intimate'],
        image: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Siwa Oasis Retreat',
        category: 'Travel',
        description:
            'Escape the city to the mysterious Siwa Oasis. A week of desert exploration, hot springs, and ancient Berber culture. Reconnect with nature in one of the most remote and beautiful locations in Egypt.',
        tags: ['Desert', 'Retreat', 'Oasis', 'Culture', 'Eco-Tourism'],
        image: 'https://images.unsplash.com/photo-1509023467864-1ecbb3f6342e?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Mediterranean Seafood Expo',
        category: 'Food & Drink',
        description:
            'The ultimate gathering for seafood lovers and industry professionals in Alexandria. Showcasing the freshest catch from the Mediterranean and innovative culinary techniques from top coastal chefs.',
        tags: ['Seafood', 'Alexandria', 'Culinary', 'Expo', 'Food'],
        image: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=1200&q=80',
    },
    {
        topic: 'Aswan Sculpting Symposium',
        category: 'Art & Culture',
        description:
            'Witness the transformation of granite in the historic city of Aswan. International sculptors gather to work on massive pieces, continuing the ancient Egyptian legacy of stone craftsmanship in a modern context.',
        tags: ['Sculpture', 'Granite', 'Art', 'Aswan', 'Craftsmanship'],
        image: 'https://images.unsplash.com/photo-1544413647-b5104914d3db?auto=format&fit=crop&w=1200&q=80',
    },
];

function eventFactory(overrides = {}) {
    const scenario = faker.helpers.arrayElement(egyptianScenarios);
    const year = faker.helpers.arrayElement([2025, 2026, 2027]);
    const title = `${scenario.topic} ${year}`;
    
    // Rotate between event-1.jpg, event-2.jpg, event-3.jpg
    const imageIndex = Math.floor(Math.random() * 3) + 1;
    const bannerPath = `events/event-${imageIndex}.jpg`;

    return {
        title,
        slug: faker.helpers.slugify(title.toLowerCase()) + '-' + faker.string.alphanumeric(6),
        description: scenario.description,
        bannerPath,
        bannerDisk: 'local',
        status: EventStatus.ACTIVE,
        type: faker.helpers.arrayElement(Object.values(EventType)),
        mode: faker.helpers.arrayElement(Object.values(EventMode)),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
        _scenario: scenario,
        ...overrides,
    };
}

export { egyptianScenarios };
export default eventFactory;
