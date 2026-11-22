const {pool} = require("./config/database");

// Small, additive schema changes that run on every startup. Each statement must be safe to run
// repeatedly (IF NOT EXISTS), so Render picks them up on deploy without anyone running SQL by hand.
const runMigrations = async () => {
    try {
        // Photo of the item from the scan, stored as a small JPEG. Nullable: manually added items have none.
        await pool.query(`ALTER TABLE item ADD COLUMN IF NOT EXISTS image_data bytea;`);
    } catch (err) {
        throw err;
    }
}

module.exports = {
    runMigrations,
}
