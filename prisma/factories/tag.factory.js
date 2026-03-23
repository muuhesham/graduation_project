import { faker } from "@faker-js/faker";

// static tags can edit it //
const eventInterests = [
    // Technology & Innovation
    'Artificial Intelligence',
    'Machine Learning Workshop',
    'Cybersecurity Summit',
    'Web Development Bootcamp',
    'Blockchain & Crypto',
    'Cloud Computing Expo',
    'Mobile App Design',
    'Robotics Competition',
    'Data Science Seminar',

    // Business & Networking
    'Startup Pitch',
    'Networking Night',
    'Career Fair',
    'Entrepreneurship Forum',
    'Leadership Retreat',
    'Marketing Strategy Workshop',
    'Real Estate Investment',
    'Fintech Conference',
    'Women in Business',

    // Arts & Culture
    'Art Exhibition',
    'Book Launch',
    'Photography Workshop',
    'Film Screening',
    'Classical Music Concert',
    'Poetry Slam',
    'Fashion Show',
    'Theater Performance',
    'Sculpture Gallery',
    'Creative Writing Class',

    // Health & Wellness
    'Yoga Session',
    'Meditation Workshop',
    'Mental Health Awareness',
    'Fitness Bootcamp',
    'Nutrition Seminar',
    'Marathon Training',
    'Zumba Class',
    'Outdoor Hiking',
    'Self-Care Day',

    // Entertainment & Social
    'Live Concert',
    'Gaming Tournament',
    'Comedy Night',
    'Trivia Quiz Night',
    'Board Game Meetup',
    'Karaoke Party',
    'Food Festival',
    'Wine Tasting',
    'Magic Show',
    'Cosplay Gathering',

    // Education & Skills
    'Cooking Masterclass',
    'Digital Marketing',
    'Language Exchange',
    'Public Speaking Workshop',
    'Photography Basics',
    'Interior Design Intro',
    'DIY Crafts Workshop',
    'Financial Literacy 101',

    // Community & Impact
    'Charity Run',
    'Volunteering Day',
    'Sustainability Summit',
    'Beach Cleanup',
    'Animal Welfare Fundraiser',
    'Blood Donation Drive',
];

function tagFactory(overrides = {}) {
    return {
        name: faker.helpers.arrayElement(eventInterests),
        ...overrides,
    }
}

export default tagFactory;