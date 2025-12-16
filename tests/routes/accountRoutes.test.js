const request = require("supertest");
const app = require("../../app");
const {pool} = require("../../src/database/config/database");

describe("API Account Routes", () => {

    beforeEach(async () => {
        await pool.query("TRUNCATE TABLE account CASCADE");
    });

    afterAll(async () => {
        await pool.end();
    });
// account_name, first_name, last_name, email, password
    describe("POST /api/auth/register", () => {
        test("should register a new user", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    account_name: "Riley's Fridge",
                    first_name: "Riley",
                    last_name: "Escamilla",
                    email: "Rileyrolls1@gmail.com",
                    password: "Rileyrolls1"
                });
            // // expect(res.status).toBe(200);
            // expect(res.body).toHaveProperty("account");
            // expect(res.body.account.email).toBe("Rileyrolls1@gmail.com");
            console.log("Status", res.status);
            console.log("Body", res.body);

            expect(res.status).toBe(201);
        });
    });

});