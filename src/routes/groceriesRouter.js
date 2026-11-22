const express = require("express");
const groceriesRouter = express.Router();
const {authenticateToken} = require("../middleware/authToken");
const {getAllGroceries, createSingleGrocery, updateSingleGrocery, deleteSingleGrocery, clearCheckedGroceries} = require("../controllers/groceriesController");

groceriesRouter.use((req, res, next) => {
    console.log("A request has been made to /groceries");
    next();
});

groceriesRouter.get("/", authenticateToken, getAllGroceries);
groceriesRouter.post("/", authenticateToken, createSingleGrocery);
// Must come before "/:id" so "checked" isn't matched as an id.
groceriesRouter.delete("/checked", authenticateToken, clearCheckedGroceries);
groceriesRouter.patch("/:id", authenticateToken, updateSingleGrocery);
groceriesRouter.delete("/:id", authenticateToken, deleteSingleGrocery);

module.exports = {
    groceriesRouter
}
