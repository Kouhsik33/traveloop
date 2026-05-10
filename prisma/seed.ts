import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cities = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Delhi',
    state: 'Delhi',
    country: 'India',
    countryCode: 'IN',
    latitude: 28.6139,
    longitude: 77.209,
    costIndex: 'medium',
    areaType: 'city',
    bestSeason: 'Oct-Mar',
    isRegionalGem: false,
    region: 'North India'
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    latitude: 26.9124,
    longitude: 75.7873,
    costIndex: 'medium',
    areaType: 'city',
    bestSeason: 'Oct-Feb',
    isRegionalGem: false,
    region: 'North India'
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    latitude: 24.5854,
    longitude: 73.7125,
    costIndex: 'medium',
    areaType: 'city',
    bestSeason: 'Sep-Mar',
    isRegionalGem: true,
    region: 'North India'
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Kochi',
    state: 'Kerala',
    country: 'India',
    countryCode: 'IN',
    latitude: 9.9312,
    longitude: 76.2673,
    costIndex: 'medium',
    areaType: 'city',
    bestSeason: 'Oct-Feb',
    isRegionalGem: false,
    region: 'South India'
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Hampi',
    state: 'Karnataka',
    country: 'India',
    countryCode: 'IN',
    latitude: 15.335,
    longitude: 76.46,
    costIndex: 'low',
    areaType: 'town',
    bestSeason: 'Nov-Feb',
    isRegionalGem: true,
    region: 'South India'
  }
];

const activityTemplates = [
  { name: 'Heritage walk', category: 'cultural', estimatedCostUsd: 18, durationHours: 2.5 },
  { name: 'Local food trail', category: 'food', estimatedCostUsd: 22, durationHours: 3 },
  { name: 'Museum visit', category: 'sightseeing', estimatedCostUsd: 10, durationHours: 2 },
  { name: 'Sunset viewpoint', category: 'sightseeing', estimatedCostUsd: 0, durationHours: 1.5 }
];

const main = async (): Promise<void> => {
  for (const city of cities) {
    const createdCity = await prisma.city.upsert({
      where: { id: city.id },
      update: city,
      create: city
    });

    const activityNames = activityTemplates.map((activity) => `${activity.name} in ${createdCity.name}`);
    await prisma.activity.deleteMany({
      where: {
        cityId: createdCity.id,
        name: { in: activityNames }
      }
    });

    for (const activity of activityTemplates) {
      await prisma.activity.create({
        data: {
          cityId: createdCity.id,
          name: `${activity.name} in ${createdCity.name}`,
          category: activity.category,
          tripTypeTags: ['solo', 'couple', 'family'],
          estimatedCostUsd: activity.estimatedCostUsd,
          durationHours: activity.durationHours,
          description: `Curated ${activity.category} experience for ${createdCity.name}.`
        }
      });
    }
  }
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
