const {pool} = require("../config/database");

// Every item column except image_data, which can be large. Photos are served by GET /api/items/:id/image.
const ITEM_COLUMNS = `item_id, account_id, profile_id, recipe_id, food_name, expiration_date, ripeness_level,
    created_at, updated_at, (image_data IS NOT NULL) AS has_image`;

const createItem = async (account_id, profile_id, recipe_id, food_name, expiration_date, ripeness_level) => {
    try {
        const {rows: [item]} = await pool.query(
            `
            INSERT INTO item(account_id, profile_id, recipe_id, food_name, expiration_date, ripeness_level)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING ${ITEM_COLUMNS};
            `,
            [account_id, profile_id, recipe_id, food_name, expiration_date, ripeness_level]
        );

        return item;
    } catch (err) {
        throw err;
    }
}

const findItemById = async (account_id, item_id) => {
    try {
        const {rows: [item]} = await pool.query(
            `
            SELECT ${ITEM_COLUMNS} FROM item
            WHERE account_id=$1
            AND item_id=$2;
            `,
            [account_id, item_id]
        );

        return item;
    } catch (err) {
        throw err;
    }
} 

const findItemsByAccountId = async (account_id) => {
    try {
        const {rows} = await pool.query(
            `
            SELECT ${ITEM_COLUMNS} FROM item
            WHERE account_id=$1
            ORDER BY expiration_date ASC;
            `,
            [account_id]
        );

        return rows;
    } catch (err) {
        throw err;
    }
}

const findItemsByProfileId = async (id) => {
    try {
        const {rows} = await pool.query(
            `
            SELECT ${ITEM_COLUMNS} FROM item
            WHERE profile_id=$1;
            `,
            [id]
        );

        return rows;
    } catch (err) {
        throw err;
    }
}

const findSoonExpiringItems = async (account_id, days) => {
    try {
        const {rows} = await pool.query(
            `
            SELECT ${ITEM_COLUMNS} FROM item
            WHERE account_id=$1
            AND expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ($2 || ' days')::INTERVAL
            AND expiration_date >= CURRENT_DATE;
            `,
            [account_id, days]
        );

        return rows;
    } catch (err) {
        throw err;
    }
}

const findExpiredItems = async (account_id) => {
    try {
        const {rows} = await pool.query(
            `
            SELECT ${ITEM_COLUMNS} FROM item
            WHERE account_id=$1
            AND expiration_date < CURRENT_DATE
            ORDER BY expiration_date DESC;
            `,
            [account_id]
        )

        return rows;
    } catch (err) {
        throw err;
    }
}

const updateItem = async (account_id, profile_id, item_id, food_name, expiration_date, ripeness_level) => {
    try {
        const {rows:[item]} = await pool.query(
            `
            UPDATE item
            SET food_name=$1, expiration_date=$2, ripeness_level=$3, updated_at= NOW()
            WHERE account_id=$4
            AND item_id=$5
            AND profile_id=$6
            RETURNING ${ITEM_COLUMNS};
            `,
            [food_name, expiration_date, ripeness_level, account_id, item_id, profile_id]
        );

        return item;
    } catch (err) {
        throw err;
    }
}

const updateItemRipeness = async ({item_id, ripeness}) => {
    try {
        const {rows: [item]} = await pool.query(
            `
            UPDATE item
            SET ripeness_level=$1
            WHERE item_id=$2
            RETURNING ${ITEM_COLUMNS};
            `,
            [ripeness, item_id]
        );

        return item;
    } catch (err) {
        throw err;
    }
}

const deleteItem = async (account_id, item_id) => {
    try {
        const {rows: [item]} = await pool.query(
            `
            DELETE FROM item
            WHERE account_id=$1
            AND item_id=$2
            RETURNING ${ITEM_COLUMNS};
            `,
            [account_id, item_id]
        );

        return item;
    } catch (err) {
        throw err;
    }
}

const deleteExpiredItems = async (account_id) => {
    try {
        const {rows} = await pool.query(
            `
            DELETE FROM item
            WHERE account_id=$1
            AND expiration_date < CURRENT_DATE
            RETURNING ${ITEM_COLUMNS};
            `,
            [account_id]
        );

        return rows;
    } catch (err) {
        throw err;
    }
}

// Inserts all items in one transaction: either every item is saved or none are.
const createItemsBulk = async (account_id, profile_id, items) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const created = [];

        for (const {food_name, expiration_date, ripeness_level} of items) {
            const {rows: [item]} = await client.query(
                `
                INSERT INTO item(account_id, profile_id, food_name, expiration_date, ripeness_level)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING ${ITEM_COLUMNS};
                `,
                [account_id, profile_id, food_name, expiration_date, ripeness_level]
            );
            created.push(item);
        }

        await client.query("COMMIT");
        return created;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    createItem,
    createItemsBulk,
    findItemById,
    findItemsByAccountId,
    findItemsByProfileId,
    findSoonExpiringItems,
    findExpiredItems,
    updateItem,
    updateItemRipeness,
    deleteItem,
    deleteExpiredItems,
}