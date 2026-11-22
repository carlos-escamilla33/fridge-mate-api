const Joi = require("joi");
const {findGroceriesByAccountId, createGrocery, updateGroceryChecked, deleteGrocery, deleteCheckedGroceries} = require("../database/models/groceryModel");
const {findProfileById} = require("../database/models/profileModel");

const grocerySchema = Joi.object({
        name: Joi.string().trim().min(1).max(100).required(),
        profileId: Joi.number().integer().positive().allow(null).optional(),
        sourceItemId: Joi.number().integer().positive().allow(null).optional(),
});

const checkedSchema = Joi.object({
        checked: Joi.boolean().required(),
});

const getAllGroceries = async (req, res, next) => {
    try {
        const accountId = req.user.id;
        const groceries = await findGroceriesByAccountId(accountId);

        return res.send({
            groceries
        });
    } catch (err) {
        next(err);
    }
}

const createSingleGrocery = async (req, res, next) => {
    try {
        const {error, value} = grocerySchema.validate(req.body);
        const accountId = req.user.id;

        if (error) {
            return res.status(400).json({message: error.details[0].message});
        }

        if (value.profileId) {
            const profile = await findProfileById(value.profileId);

            if (!profile || profile.account_id !== accountId) {
                return res.status(403).json({message: "That profile doesn't belong to this account"});
            }
        }

        const grocery = await createGrocery(accountId, value.profileId ?? null, value.name, value.sourceItemId ?? null);

        return res.status(201).json({
            message: "Added to grocery list!",
            grocery
        });
    } catch (err) {
        next(err);
    }
}

const updateSingleGrocery = async (req, res, next) => {
    try {
        const {error, value} = checkedSchema.validate(req.body);
        const accountId = req.user.id;

        if (error) {
            return res.status(400).json({message: error.details[0].message});
        }

        const grocery = await updateGroceryChecked(accountId, req.params.id, value.checked);

        if (!grocery) {
            return res.status(404).json({message: "Grocery item not found"});
        }

        return res.send({
            grocery
        });
    } catch (err) {
        next(err);
    }
}

const deleteSingleGrocery = async (req, res, next) => {
    try {
        const accountId = req.user.id;
        const grocery = await deleteGrocery(accountId, req.params.id);

        if (!grocery) {
            return res.status(404).json({message: "Grocery item not found"});
        }

        return res.send({
            message: "Removed from grocery list",
            grocery
        });
    } catch (err) {
        next(err);
    }
}

const clearCheckedGroceries = async (req, res, next) => {
    try {
        const accountId = req.user.id;
        const groceries = await deleteCheckedGroceries(accountId);

        return res.send({
            message: `Cleared ${groceries.length} item${groceries.length === 1 ? "" : "s"}`,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllGroceries,
    createSingleGrocery,
    updateSingleGrocery,
    deleteSingleGrocery,
    clearCheckedGroceries,
}
