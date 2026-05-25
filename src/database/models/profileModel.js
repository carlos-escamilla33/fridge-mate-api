const {pool} = require("../config/database");

const createProfile = async (account_id, first_name) => {
    try {
        const {rows: [profile]} = await pool.query(
            `
            INSERT INTO profile(account_id, first_name, notifications_enabled)
            VALUES($1, $2, $3)
            RETURNING *;
            `,
            [account_id, first_name, true]
        );

        return profile;
    } catch (err) {
        throw err;
    }
}

const findProfileByName = async (account_id, first_name) => {
    try {
        const {rows: [profile]} = await pool.query(
            `
            SELECT * FROM profile
            WHERE account_id=$1
            AND first_name=$2
            `,
            [account_id, first_name]
        );

        return profile;
    } catch (err) {
        throw err;
    }
}

const findProfileById = async (id) => {
    try {
        const {rows: [profile]} = await pool.query(
            `
            SELECT * FROM profile
            WHERE profile_id=$1;
            `,
            [id]
        );

        return profile;
    } catch (err) {
        throw err;
    }
}

const findProfilesByAccountId = async (account_id) => {
    try {
        const {rows} = await pool.query(
            `
            SELECT * FROM profile
            WHERE account_id=$1;
            `,
            [account_id]
        );

        return rows;
    } catch (err) {
        throw err;
    }
}

const updateProfile = async (profile_id, account_id, first_name) => {
    try {
        const {rows: [profile]} = await pool.query(
            `
            UPDATE profile
            SET first_name=$1
            WHERE profile_id=$2
            AND account_id=$3
            RETURNING *;
            `,
            [first_name, profile_id, account_id]
        );

        return profile;
    } catch (err) {
        throw err;
    }
}

const toggleProfileNotifications = async (account_id, profile_id, isNotificationsEnabled) => {
    try {
        const {rows: [profile]} = await pool.query(
            `
            UPDATE profile
            SET notifications_enabled=$1
            WHERE account_id=$2
            AND profile_id=$3
            RETURNING *;
            `,
            [isNotificationsEnabled, account_id, profile_id]
        );

        return profile;
    } catch (err) {
        throw err;
    }
}

const deleteProfile = async (account_id, profile_id) => {
    try {
        const {rows: [profile]} = await pool.query(
            `
            DELETE FROM profile
            WHERE account_id=$1
            AND profile_id=$2
            RETURNING *;
            `,
            [account_id, profile_id]
        )

        return profile;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    createProfile,
    findProfileByName,
    findProfileById,
    findProfilesByAccountId,
    updateProfile,
    toggleProfileNotifications,
    deleteProfile,
}