const express = require("express");
const router = express.Router();

const prisma = require("../prisma");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Given a User id, generate a token
 * 
 * @param {number} id 
 * @returns Signed token
 */
function createToken(id) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" });
}

// Runs with every request; verifies token provided in request header
// * if successful, stores corresponding user to req.user
router.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.slice(7);
    if (!token) return next();
    try {
        const { id } = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUniqueOrThrow({
            where: { id },
        })
        req.user = user;
        next();
    } catch (e) {
        next(e);
    }
});

// POST /register; registers a new user
// * username must be unique
router.post("/register", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.register(username, password);
        const token = createToken(user.id);
        res.status(201).json({ token });
    } catch (e) {
        next(e);
    }
});

// POST /login; logs in a user with credentials provided
router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.login(username, password);
        const token = createToken(user.id);
        res.json({ token })
    } catch (e) {
        next(e);
    }
});

/**
 * Middleware that checks for whether a user is logged in
 * Currently applied to /playlists endpoints
 * 
 * @param {Object} req Request
 * @param {Object} res Response
 * @param {function()} next Express middleware function that navigates
 * to next middleware function
 */
function authenticate(req, res, next) {
    if (req.user) {
        next();
    } else {
        next({ status: 401, message: "You must be logged in."});
    }
}

module.exports = {
    router,
    authenticate
}