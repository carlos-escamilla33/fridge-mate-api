const express = require("express");
const itemsRouter = express.Router();
const {authenticateToken} = require("../middleware/authToken");
const {scanItems, createBulkItems, getItemImage, dismissSuggestion, getAllAccountItems, createSingleItem, getSingleItem, updateSingleItem, deleteSingleItem, getSoonExpiringItems, getExpiredItems} = require("../controllers/itemsController");

itemsRouter.use((req, res, next) => {
    console.log("A request has been made to /items");
    next();
});

// Must come before "/:id" so they aren't matched as item ids.
itemsRouter.post("/scan", authenticateToken, scanItems);
itemsRouter.post("/bulk", authenticateToken, createBulkItems);
itemsRouter.post("/dismiss-suggestion", authenticateToken, dismissSuggestion);
itemsRouter.get("/", authenticateToken, getAllAccountItems);
itemsRouter.post("/", authenticateToken, createSingleItem);
itemsRouter.get("/:id/image", authenticateToken, getItemImage);
itemsRouter.get("/:id", authenticateToken, getSingleItem);
itemsRouter.put("/:id", authenticateToken, updateSingleItem);
itemsRouter.delete("/:id", authenticateToken, deleteSingleItem);
itemsRouter.get("/expiring/:days", authenticateToken, getSoonExpiringItems);
itemsRouter.get("/list/expired", authenticateToken, getExpiredItems);

module.exports = {
    itemsRouter
}