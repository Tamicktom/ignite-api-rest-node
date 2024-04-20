import { it, beforeAll, afterAll, describe, expect } from "vitest";
import supertest from "supertest";

import { app } from "../src/app";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

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
});


