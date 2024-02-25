import fastify from "fastify";
import crypto from "node:crypto";

//* Local imports
import { knex } from "./database";

const app = fastify({ logger: true });

app.get("/", async (request, reply) => {
  const transaction = await knex("transactions")
    .insert({
      id: crypto.randomUUID(),
      title: "Transação de teste",
      amount: 1000,
    })
    .returning("*");

  return { transaction };
});

app.listen({ port: 3000 }).then((address) => {
  console.log(`Server listening on ${address}`);
});
