const bcrypt = require("bcrypt");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient().$extends({
    model: {
        user: {
            /**
             * Registers a new user
             * 
             * @param {string} username 
             * @param {string} password 
             * @returns User object
             */
            async register(username, password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = await prisma.user.create({
                    data: { username, password: hashedPassword },
                });
                return user;
            },
            /**
             * Logs in user with given credentials
             * 
             * @param {string} username 
             * @param {string} password 
             * @returns User object
             */
            async login(username, password) {
                const user = await prisma.user.findUniqueOrThrow({
                    where: { username },
                });
                const valid = await bcrypt.compare(password, user.password);
                if (!valid) throw Error("Invalid password");
                return user;
            },
        },
    },
});

module.exports = prisma;