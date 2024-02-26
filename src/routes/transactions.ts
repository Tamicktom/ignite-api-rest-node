//* Libraries imports
import crypto from "node:crypto";
import { FastifyInstance } from "fastify";
import z from "zod";

//* Local imports
import { knex } from "../database";

const createTransactionSchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(["credit", "debit"]),
});

const getTransactionSchema = z.object({
  id: z.string().uuid(),
});

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knex("transactions").select("*");

    return { transactions };
  });

  app.get("/:id", async (request, reply) => {
    const { id } = getTransactionSchema.parse(request.params);

    const transaction = await knex("transactions").where("id", id).first();

    if (!transaction) {
      return reply.status(404).send({ error: "Transaction not found" });
    }

    return { transaction };
  });

  app.post("/", async (request, reply) => {
    const body = createTransactionSchema.parse(request.body);

    const id = crypto.randomUUID();

    await knex("transactions").insert({
      id,
      title: body.title,
      amount: body.type === "credit" ? body.amount : body.amount * -1,
    });

    return reply.status(201).send({ id });
  });
}
