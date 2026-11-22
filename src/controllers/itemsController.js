const {findItemsByAccountId, createItem, createItemsBulk, findItemImage, dismissGrocerySuggestion, findItemById, updateItem, deleteItem, findSoonExpiringItems, findExpiredItems} = require("../database/models/itemModel");
const {findProfileById} = require("../database/models/profileModel");
const {scanFoodImage} = require("../services/foodScanner");
const Joi = require("joi");
const itemSchema = Joi.object({
        profileId: Joi.number().integer().positive().required(),
        recipeId: Joi.number().integer().allow(null).optional(),
        foodName: Joi.string().min(2).max(100).required(),
        expirationDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
        ripenessLevel: Joi.string().min(3).max(30).required()
});

const getAllAccountItems = async (req, res, next) => {
    try {
        const accountId = req.user.id;
        const items = await findItemsByAccountId(accountId);

        return res.send({
            items
        });
    } catch (err) {
        next(err);
    }
}

const createSingleItem = async (req, res, next) => {
    try {
        const {error, value} = itemSchema.validate(req.body);
        const accountId = req.user.id;

        if (error) {
            return res.status(400).json({error: error.details});
        }

        const {profileId, recipeId, foodName, expirationDate, ripenessLevel} = value;
        const item = await createItem(accountId, profileId, recipeId, foodName, expirationDate, ripenessLevel);

        if (!item) {
            return res.status(500).json({message: "Error creating item"});
        }

        return res.send({
            message: "item created successfully!",
            item
        });
    } catch (err) {
        next(err);
    }
}

const getSingleItem = async (req, res, next) => {
    try {
        const itemId = req.params.id;
        const accountId = req.user.id;
        const item = await findItemById(accountId, itemId);

        if (!item) {
            return res.status(404).json({message: "Item not found"});
        }

        return res.send({
            item
        });
    } catch (err) {
        next(err);
    }
}

const updateSingleItem = async (req, res, next) => {
    try {
        const {error, value} = itemSchema.validate(req.body);
        const accountId = req.user.id;
        const itemId = req.params.id;

        if (error) {
            return res.status(400).json({error: error.details});
        }

        const {profileId, foodName, expirationDate, ripenessLevel} = value;
        const item = await updateItem(accountId, profileId, itemId, foodName, expirationDate, ripenessLevel);

        if (!item) {
            return res.status(404).json({message: "Item not found"});
        }

        return res.send({
            message: "Item updated successfully!",
            item
        });
    } catch (err) {
        next(err);
    }
}

const deleteSingleItem = async (req, res, next) => {
    try {
        const itemId = req.params.id;
        const accountId = req.user.id;

        const item = await deleteItem(accountId, itemId);

        if (!item) {
            return res.status(404).json({message: "Item not found"});
        }

        return res.send({
            message: "Successfully deleted item!",
            item
        });
    } catch (err) {
        next(err);
    }
}

const getSoonExpiringItems = async (req, res, next) => {
    try {
        const daysOut = req.params.days;
        const accountId = req.user.id;

        const items = await findSoonExpiringItems(accountId, daysOut);

        return res.send({
            items
        });
    } catch (err) {
        next(err);
    }
}

const getExpiredItems = async (req, res, next) => {
    try {
        const accountId = req.user.id;

        const items = await findExpiredItems(accountId);

        return res.send({
            items
        });
    } catch (err) {
        next(err);
    }
}

const scanSchema = Joi.object({
        image: Joi.string().base64().required(),
        mediaType: Joi.string().valid("image/jpeg", "image/png", "image/webp").required(),
});

const scanItems = async (req, res, next) => {
    try {
        const {error, value} = scanSchema.validate(req.body);

        if (error) {
            return res.status(400).json({message: error.details[0].message});
        }

        const items = await scanFoodImage(value.image, value.mediaType);

        return res.send({items});
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({message: err.message});
        }
        next(err);
    }
}

const MAX_QUANTITY = 99;

const bulkSchema = Joi.object({
        profileId: Joi.number().integer().positive().required(),
        items: Joi.array().min(1).max(50).required().items(Joi.object({
                foodName: Joi.string().min(2).max(100).required(),
                expirationDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
                ripenessLevel: Joi.string().min(1).max(30).required(),
                quantity: Joi.number().integer().min(1).max(MAX_QUANTITY).default(1),
                image: Joi.string().base64().max(400000).optional(),
        })),
});

const createBulkItems = async (req, res, next) => {
    try {
        const {error, value} = bulkSchema.validate(req.body);
        const accountId = req.user.id;

        if (error) {
            return res.status(400).json({message: error.details[0].message});
        }

        const profile = await findProfileById(value.profileId);

        if (!profile || profile.account_id !== accountId) {
            return res.status(403).json({message: "That profile doesn't belong to this account"});
        }

        // One row per item, with its quantity (a bag of 12 rolls is one entry, quantity 12).
        const rows = value.items.map((item) => ({
            food_name: item.foodName,
            quantity: item.quantity,
            expiration_date: item.expirationDate,
            ripeness_level: item.ripenessLevel,
            image_data: item.image ? Buffer.from(item.image, "base64") : null,
        }));

        const items = await createItemsBulk(accountId, value.profileId, rows);

        return res.status(201).json({
            message: `Added ${items.length} item${items.length === 1 ? "" : "s"}!`,
            items
        });
    } catch (err) {
        next(err);
    }
}

const getItemImage = async (req, res, next) => {
    try {
        const accountId = req.user.id;
        const image = await findItemImage(accountId, req.params.id);

        if (!image) {
            return res.status(404).json({message: "No photo for this item"});
        }

        res.set("Content-Type", "image/jpeg");
        res.set("Cache-Control", "private, max-age=86400");
        return res.send(image);
    } catch (err) {
        next(err);
    }
}

const dismissSchema = Joi.object({
        foodName: Joi.string().trim().min(1).max(255).required(),
});

const dismissSuggestion = async (req, res, next) => {
    try {
        const {error, value} = dismissSchema.validate(req.body);
        const accountId = req.user.id;

        if (error) {
            return res.status(400).json({message: error.details[0].message});
        }

        const dismissed = await dismissGrocerySuggestion(accountId, value.foodName);

        return res.send({
            message: "Suggestion dismissed",
            itemIds: dismissed.map((row) => row.item_id)
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    scanItems,
    dismissSuggestion,
    getItemImage,
    createBulkItems,
    getAllAccountItems,
    createSingleItem,
    getSingleItem,
    updateSingleItem,
    deleteSingleItem,
    getSoonExpiringItems,
    getExpiredItems,
}