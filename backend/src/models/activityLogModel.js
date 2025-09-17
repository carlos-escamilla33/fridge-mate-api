const {pool} = require("../config/database");

const createActivityLog = async ({account_id, profile_id, action_type}) => {
    try {   
        const {rows: [activity_log]} = await pool.query(
            `
            INSERT INTO activity_log(account_id, profile_id, action_type)
            VALUES($1, $2, $3)
            RETURNING *;
            `,
            [account_id, profile_id, action_type]
        );

        return activity_log;
    } catch (err) {
        throw err;
    }
}

const findActivityLogByAccountId = async (account_id) => {
    try {
        const {rows: [activity_log]} = await pool.query(
            `
            SELECT * FROM activity_log
            WHERE account_id=$1;
            `,
            [account_id]
        );

        return activity_log
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createActivityLog,
    findActivityLogByAccountId,
}