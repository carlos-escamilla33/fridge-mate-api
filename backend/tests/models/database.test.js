const pool = require("../../src/config/database");

test("Checking connection to database", async () => {
  const res = await pool.query("SELECT NOW()");
  expect(res).toBeDefined();
  expect(res.rows.length).toBe(1);
});

test("The connection to database fails", async () => {
    await expect(pool.query("SELECT * FROM nonexistantTable"))
        .rejects
        .toThrow();
});

afterAll(async () => {
    await pool.end();
});
