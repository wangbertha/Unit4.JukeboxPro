const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");

// GET /tracks
router.get("/", async (req, res, next) => {
    try {
        const tracks = await prisma.track.findMany();
        res.json(tracks);
    } catch (e) {
        next(e);
    }
});

// GET /tracks/:id
// * if no one is logged in, do not return corresponding playlists
// * if user is logged in, return playlists created by that user
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const includePlaylists = user 
            ? { where: { ownerId: user.id } } 
            : false;
        const track = await prisma.track.findUniqueOrThrow({
            where: { id: +id },
            include: { playlists: includePlaylists },
        });
        res.json(track);
    } catch (e) {
        next(e);
    }
});