const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");

const seed = async (numTracks) => {
    const tracks = Array.from({ length: numTracks }, (_, i) => ({
        name: faker.music.songName(),
    }));
    await prisma.track.createMany({
        data: tracks
    });
};
seed(20)
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });