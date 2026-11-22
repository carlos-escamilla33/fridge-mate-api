const {pool} = require("./config/database");

// Small, additive schema changes that run on every startup. Each statement must be safe to run
// repeatedly (IF NOT EXISTS), so Render picks them up on deploy without anyone running SQL by hand.
const runMigrations = async () => {
    try {
        // Photo of the item from the scan, stored as a small JPEG. Nullable: manually added items have none.
        await pool.query(`ALTER TABLE item ADD COLUMN IF NOT EXISTS image_data bytea;`);

        // Shared household grocery list. source_item_id points at the fridge item it was suggested
        // from (no foreign key, since that item is usually used up and deleted).
        await pool.query(`
            CREATE TABLE IF NOT EXISTS grocery_item (
                grocery_item_id SERIAL PRIMARY KEY,
                account_id integer NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
                profile_id integer REFERENCES profile(profile_id) ON DELETE SET NULL,
                name character varying(100) NOT NULL,
                source_item_id integer,
                checked boolean NOT NULL DEFAULT false,
                created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (err) {
        throw err;
    }
}

module.exports = {
    runMigrations,
}
