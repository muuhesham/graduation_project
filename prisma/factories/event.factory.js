import { faker } from '@faker-js/faker';
import EventStatus from './../../src/constants/enums/eventStatus.js';
import EventType from './../../src/constants/enums/eventType.js';
import EventMode from './../../src/constants/enums/eventMode.js';

const egyptianScenarios = [
    {
        topic: 'RiseUp Tech Summit',
        category: 'Technology',
        description: 'The leading tech and entrepreneurship event in the MENA region. Join thousands of founders, investors, and tech enthusiasts at the GrEEK Campus for three days of networking, pitches, and innovation keynotes.',
        tags: ['Entrepreneurship', 'Startups', 'Venture Capital', 'Innovation', 'Technology'],
        priceRange: { min: 500, max: 2500 },
        tiers: ['Early Bird', 'Standard', 'Investor Pass'],
    },
    {
        topic: 'Cairo Jazz Festival',
        category: 'Music',
        description: 'An annual celebration of jazz music featuring international and local artists. Experience the rhythm of the city at Cairo Opera House with performances ranging from classic swing to modern fusion.',
        tags: ['Live Music', 'Jazz', 'Cultural Event', 'Art', 'Entertainment'],
        priceRange: { min: 200, max: 1200 },
        tiers: ['Standing', 'Seated', 'VIP Table'],
    },
    {
        topic: 'Pyramids Half Marathon',
        category: 'Sports',
        description: 'Run through history. A world-class running event taking place at the Giza Pyramids Plateau. Choose between 5K, 10K, or 21K while enjoying the majestic view of the Great Pyramids.',
        tags: ['Fitness', 'Running', 'Athletics', 'Historical', 'Outdoor'],
        priceRange: { min: 300, max: 800 },
        tiers: ['5K Run', '10K Run', '21K Half Marathon'],
    },
    {
        topic: 'Web3 & Blockchain Cairo',
        category: 'Technology',
        description: 'Exploring the future of decentralized finance and digital assets in Egypt. Featuring keynote speakers from top global exchanges and workshops on smart contracts and NFTs.',
        tags: ['Blockchain', 'Crypto', 'Web3', 'Finance', 'FinTech'],
        priceRange: { min: 100, max: 500 },
        tiers: ['Student', 'Professional', 'Developer'],
    },
    {
        topic: 'Alexandria Film Festival',
        category: 'Art & Culture',
        description: 'A prestigious cinematic event showcasing Mediterranean films and documentaries. Join us for screenings, workshops, and panel discussions at the Bibliotheca Alexandrina.',
        tags: ['Cinema', 'Filmmaking', 'Mediterranean', 'Awards', 'Culture'],
        priceRange: { min: 50, max: 300 },
        tiers: ['Single Screening', 'Day Pass', 'Full Festival Pass'],
    },
    {
        topic: 'Egyptian Food Festival',
        category: 'Food & Drink',
        description: 'Satisfy your hunger and taste the flavors of Egypt from traditional Koshary to modern fusion. Live cooking shows by celebrity chefs and a huge street food market.',
        tags: ['Foodie', 'Cooking', 'Culinary', 'Street Food', 'Dining'],
        priceRange: { min: 150, max: 600 },
        tiers: ['Entry Only', 'Food Taster', 'Premium Dining'],
    },
    {
        topic: 'Cairo Comic Con',
        category: 'Entertainment',
        description: 'The ultimate pop culture celebration in Egypt. Cosplay competitions, artist alleys, and exclusive merch from your favorite movies and anime.',
        tags: ['Cosplay', 'Gaming', 'Anime', 'Pop Culture', 'Geek'],
        priceRange: { min: 250, max: 1000 },
        tiers: ['Standard', 'VIP', 'Fast Pass'],
    },
    {
        topic: 'Luxor Ancient Egypt Workshop',
        category: 'Travel',
        description: 'An immersive historical experience in the heart of Luxor. Guided tours by archeologists and workshops on hieroglyphics and ancient craft.',
        tags: ['History', 'Tourism', 'Archaeology', 'Travel', 'Egyptology'],
        priceRange: { min: 800, max: 3000 },
        tiers: ['Basic Tour', 'Photography Pass', 'Private Archeologist Guide'],
    },
    {
        topic: 'Red Sea Diving Championship',
        category: 'Sports',
        description: 'International diving competition in Hurghada. Spectacular underwater displays and workshops on marine conservation.',
        tags: ['Diving', 'Marine Life', 'Red Sea', 'Competition', 'Water Sports'],
        priceRange: { min: 200, max: 1500 },
        tiers: ['Spectator', 'Participant', 'Pro Diver'],
    },
    {
        topic: 'Nile Felucca Music Series',
        category: 'Music',
        description: 'Intimate acoustic performances on traditional sailboats gliding down the Nile at sunset. Experience local indie folk and traditional melodies.',
        tags: ['Indie', 'Acoustic', 'Nile', 'Sunset', 'Intimate'],
        priceRange: { min: 400, max: 900 },
        tiers: ['Shared Felucca', 'Private Boat'],
    },
    {
        topic: 'Aswan Sculpting Symposium',
        category: 'Art & Culture',
        description: 'Witness the transformation of granite in the historic city of Aswan. International sculptors gather to work on massive pieces, continuing the ancient Egyptian legacy.',
        tags: ['Sculpture', 'Granite', 'Art', 'Aswan', 'Craftsmanship'],
        priceRange: { min: 0, max: 200 },
        tiers: ['General Admission', 'Workshop Attendee'],
    },
    {
        topic: 'Siwa Oasis Retreat',
        category: 'Travel',
        description: 'Escape the city to the mysterious Siwa Oasis. A week of desert exploration, hot springs, and ancient Berber culture.',
        tags: ['Desert', 'Retreat', 'Oasis', 'Culture', 'Eco-Tourism'],
        priceRange: { min: 2000, max: 7000 },
        tiers: ['Standard Camp', 'Luxury Lodge'],
    },
    {
        topic: 'Cairo Design Week',
        category: 'Art & Culture',
        description: 'Celebrating the best of Egyptian design across fashion, architecture, and interior design. Exhibitions and talks by industry leaders.',
        tags: ['Design', 'Architecture', 'Fashion', 'Creativity', 'Interior'],
        priceRange: { min: 100, max: 800 },
        tiers: ['Exhibition Access', 'Conference Pass'],
    },
    {
        topic: 'Startup Investment Night',
        category: 'Business',
        description: 'An exclusive networking event for angel investors and high-growth startups. Pitches, dinner, and strategic partnership discussions.',
        tags: ['Networking', 'Investment', 'Funding', 'Business', 'Equity'],
        priceRange: { min: 1000, max: 5000 },
        tiers: ['Startup Entry', 'Angel Investor', 'VC Partner'],
    },
    {
        topic: 'Global Education Forum',
        category: 'Education',
        description: 'Connecting students with top universities worldwide. Information sessions on scholarships, study abroad programs, and career counseling.',
        tags: ['University', 'Scholarships', 'Learning', 'Career', 'Students'],
        priceRange: { min: 0, max: 0 },
        tiers: ['Free Registration'],
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
        type: scenario.priceRange?.min === 0 ? EventType.FREE : EventType.TICKETED,
        mode: faker.helpers.arrayElement(Object.values(EventMode)),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
        _scenario: scenario,
        ...overrides,
    };
}

export { egyptianScenarios };
export default eventFactory;
