import { it, beforeAll, beforeEach, afterAll, describe, expect } from "vitest";
import { execSync } from "node:child_process";
import supertest from "supertest";

import { app } from "../src/app";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  })

  it("Should be able to create a new transaction", async () => {
    await supertest(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit"
      })
      .expect(201)
  });

  it("Should be able to list all transactions", async () => {
    const response = await supertest(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit"
      })

    const cookies = response.get("Set-Cookie");

    // expect cookies to be an array
    expect(cookies).toBeInstanceOf(Array);

    if (!cookies) {
      throw new Error("No cookies");
    }

    const listTransactionResponse = await supertest(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200)

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New transaction",
        amount: 5000,
      }),
    ]);
  });

  it("Should be able to get a specific transaction", async () => {
    const response = await supertest(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit"
      })

    const cookies = response.get("Set-Cookie");

    // expect cookies to be an array
    expect(cookies).toBeInstanceOf(Array);

    if (!cookies) {
      throw new Error("No cookies");
    }

    const listTransactionResponse = await supertest(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200)

    const transactionId = listTransactionResponse.body.transactions[0].id;

    const getTransactionResponse = await supertest(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New transaction",
        amount: 5000,
      }),
    );
  });

  it("Should be able to get the summary of the transactions", async () => {
    const newTransactionResponse = await supertest(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit"
      })

    const cookies = newTransactionResponse.get("Set-Cookie");

    // expect cookies to be an array
    expect(cookies).toBeInstanceOf(Array);

    if (!cookies) {
      throw new Error("No cookies");
    }

    await supertest(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Debit transaction",
        amount: 2000,
        type: "debit"
      })

    const summaryResponse = await supertest(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    });
  });
});


