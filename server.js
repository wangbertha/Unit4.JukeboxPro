const express = require("express");
const app = express();
const PORT = 3000;

require("dotenv").config();

// Logs requests
app.use(require("morgan")("dev"));

// Parses JSON requests into req.body
app.use(express.json());

// Endpoint routes
app.use(require('./api/auth').router);
app.use("/playlists", require("./api/playlists"));
app.use("/tracks", require("./api/tracks"));

// Error-handling middleware
app.use((req, res, next) => {
    next({ status: 404, message: "Endpoint not found" });
});
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status ?? 500);
    res.json(err.message ?? "Something went wrong :(");
});

// Listen on PORT
app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});