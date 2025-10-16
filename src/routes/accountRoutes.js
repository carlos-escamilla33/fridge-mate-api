const express = require("express");
const accountsRouter = express.Router();
const {authenticateToken} = require("../middleware/authToken")
const {registerProfile} = require("../controllers/accountsController");

accountsRouter.use((req, res, next) => {
    console.log("A request has been made to /account");
});

accountsRouter.get("/register/profile", authenticateToken, registerProfile);

module.exports = {
    accountsRouter
}


