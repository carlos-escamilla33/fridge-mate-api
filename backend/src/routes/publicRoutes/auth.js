const express = require("express");
const authRouter = express.Router();
const {register} = require("../controllers/authController");

authRouter.use((req, res, next) => {
    console.log("A request has been made to /auth");

    next();
});

authRouter.post("/register", register);

module.exports = {
    authRouter
}