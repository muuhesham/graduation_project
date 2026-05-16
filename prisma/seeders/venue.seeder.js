import venueFactory from "../factories/venue.factory.js";

async function seedVenues(prisma) {
    let venues = [];
    console.log("Seeding venues...");

    const governorates = await prisma.governorate.findMany();
    
    for (let i = 0; i < 100; i++) {
        const governorate = governorates[Math.floor(Math.random() * governorates.length)];
        const event = await prisma.venue.create({
            data: {
                ...venueFactory(),
                governorateId: governorate.id,
            }
        });
        venues.push(event);
    }
    console.log("Venues seeded.");
    return venues;
}

export default seedVenues;