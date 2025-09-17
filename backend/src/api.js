const express = require("express");
const apiRouter = express.Router();
const authRouter = require("./routes/publicRoutes/auth");

apiRouter.use("/auth", authRouter);

module.exports = apiRouter;