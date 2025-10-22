const express = require("express");
const itemsRouter = express.Router();
const {authenticateToken} = require("../middleware/authToken");
const {getAllAccountItems} = require("../controllers/itemsController");

itemsRouter.use((req, res, next) => {
    console.log("A request has been made to /items");
    next();
});

itemsRouter.get("/items", authenticateToken, getAllAccountItems);

module.exports = {
    itemsRouter
}