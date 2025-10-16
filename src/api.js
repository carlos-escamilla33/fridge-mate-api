const express = require("express");
// const jwt = require("jsonwebtoken");
const apiRouter = express.Router();
const {authRouter} = require("./routes/authRoutes");
const {accountsRouter} = require("./routes/accountRoutes");

apiRouter.use("/auth", authRouter);
apiRouter.use("/accounts", accountsRouter);


module.exports = apiRouter;