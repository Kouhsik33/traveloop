const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.$executeRaw`DELETE FROM community_place_messages WHERE is_system = TRUE`;
    console.log(`✓ Deleted ${result} hardcoded messages`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
