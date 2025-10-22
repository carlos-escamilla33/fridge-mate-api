const {findItemsByAccountId, createItem} = require("../database/models/itemModel");

const getAllAccountItems = async (req, res, next) => {
    const accountId = req.user.id;
    try {
        const items = findItemsByAccountId(accountId);

        return res.send({
            items
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllAccountItems,
}