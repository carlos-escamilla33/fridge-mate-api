const {pool} = require("../config/database");
const { hashPasswordHelper, generateCodeHelper } = require("./helpers");

const createAccount = async ({account_name, first_name, last_name, email, password,}) => {
  const client = await pool.connect();

  try {
    const accCode = generateCodeHelper(account_name);
    const hashedPassword = await hashPasswordHelper(password);

    await client.query("BEGIN");

    const {rows: [account]} = await client.query(
      `
        INSERT INTO account(account_name, account_code, email, password)
        VALUES($1, $2, $3, $4)
        RETURNING *;
        `,
      [account_name, accCode, email, hashedPassword]
    );

    const {rows: [profile]} = await client.query(
      `
        INSERT INTO profile(account_id, first_name, last_name, notifications_enabled)
        VALUES($1, $2, $3, $4)
        RETURNING *;
      `,
      [account.account_id, first_name, last_name, true]
    );

    await client.query("COMMIT");

    return {
      account,
      profile,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code == "23505") {
      throw new Error("Account name already exists");
    }
    throw err;
  } finally {
    client.release();
  }
};

const getAllAccounts = async () => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM account
      `);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getAccountByCode = async (code) => {
  try {
    const {
      rows: [account],
    } = await pool.query(
      `
        SELECT * FROM account
        WHERE account_code=$1
        RETURNING *;
      `,
      [code]
    );
    return account;
  } catch (err) {
    throw err;
  }
};

const updateAccount = async ({ account_id, account_name }) => {
  try {
    const {
      rows: [account],
    } = await pool.query(
      `
        UPDATE account
        SET account_name=$1
        WHERE account_id=$2
        RETURNING *;
      `,
      [account_name, account_id]
    );
    return account;
  } catch (err) {
    throw err;
  }
};

const getAccountById = async (id) => {
  try {
    const {
      rows: [account],
    } = await pool.query(
      `
        SELECT * FROM account
        WHERE account_id=$1;
      `,
      [id]
    );
    return account;
  } catch (err) {
    throw err;
  }
};

const deleteAccount = async (account_id) => {
  try {
    const {
      rows: [account],
    } = await pool.query(
      `
      DELETE FROM account
      WHERE account_id=$1
      RETURNING *;
      `,
      [account_id]
    );
    return account;
  } catch (err) {
    if (err.code == "42P01") {
      throw new Error("Account does not exist");
    }
    throw err;
  }
};

module.exports = {
  createAccount,
  deleteAccount,
  getAllAccounts,
  updateAccount,
  getAccountByCode,
  getAccountById,
};
