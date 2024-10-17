const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");

// GET /playlists corresponding to logged in user
router.get("/", async (req, res, next) => {
    try {
        const user = req.user;
        const playlists = await prisma.playlist.findMany({
            where: { ownerId: user.id },
        });
        res.json(playlists);
    } catch (e) {
        next(e);
    }
});

// POST /playlists to logged in user
router.post("/", async (req, res, next) => {
    try {
        const { name, description, trackIds } = req.body;
        const user = req.user;
        const trackIdsPrisma = trackIds.map((id) => ({ id }));
        const playlist = await prisma.playlist.create({
            data: {
                name, description, ownerId: user.id, tracks: { connect: trackIdsPrisma },
            },
            include: { tracks: true },
        });
        res.status(201).json(playlist);
    } catch (e) {
        next(e);
    }
});

// GET /playlists/:id with a list of its tracks
// * if the playlist does not belong to the logged in user, return 403 status
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const playlist = await prisma.playlist.findUniqueOrThrow({
            where: { id: +id },
            include: { tracks: true },
        });
        if (user.id !== playlist.ownerId) {
            next({ status: 403, message: "You are not authorized to view this playlist." });
        }
        res.json(playlist);
    } catch (e) {
        next(e);
    }
});