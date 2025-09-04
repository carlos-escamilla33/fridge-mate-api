const pool = require("../config/database");

const createAccount = async ({ accountName, accountCode }) => {
  try {
    const {rows: [account]} = await pool.query(
      `
        INSERT INTO account(account_name, account_code)
        VALUES($1, $2)
        RETURNING *;
        `,
      [accountName, accountCode]
    );

    return account;
  } catch (err) {
    if (err.code == "23505") {
        throw new Error("Account name already exists");
    }
    throw err;
  }
};

module.exports = {
    createAccount,
}
