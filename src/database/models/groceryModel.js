const {pool} = require("../config/database");

const findGroceriesByAccountId = async (account_id) => {
    try {
        const {rows} = await pool.query(
            `
            SELECT * FROM grocery_item
            WHERE account_id=$1
            ORDER BY checked ASC, created_at DESC;
            `,
            [account_id]
        );

        return rows;
    } catch (err) {
        throw err;
    }
}

const createGrocery = async (account_id, profile_id, name, source_item_id) => {
    try {
        const {rows: [grocery]} = await pool.query(
            `
            INSERT INTO grocery_item(account_id, profile_id, name, source_item_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
            `,
            [account_id, profile_id, name, source_item_id]
        );

        return grocery;
    } catch (err) {
        throw err;
    }
}

const updateGroceryChecked = async (account_id, grocery_item_id, checked) => {
    try {
        const {rows: [grocery]} = await pool.query(
            `
            UPDATE grocery_item
            SET checked=$1
            WHERE account_id=$2
            AND grocery_item_id=$3
            RETURNING *;
            `,
            [checked, account_id, grocery_item_id]
        );

        return grocery;
    } catch (err) {
        throw err;
    }
}

const deleteGrocery = async (account_id, grocery_item_id) => {
    try {
        const {rows: [grocery]} = await pool.query(
            `
            DELETE FROM grocery_item
            WHERE account_id=$1
            AND grocery_item_id=$2
            RETURNING *;
            `,
            [account_id, grocery_item_id]
        );

        return grocery;
    } catch (err) {
        throw err;
    }
}

const deleteCheckedGroceries = async (account_id) => {
    try {
        const {rows} = await pool.query(
            `
            DELETE FROM grocery_item
            WHERE account_id=$1
            AND checked=true
            RETURNING *;
            `,
            [account_id]
        );

        return rows;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    findGroceriesByAccountId,
    createGrocery,
    updateGroceryChecked,
    deleteGrocery,
    deleteCheckedGroceries,
}
