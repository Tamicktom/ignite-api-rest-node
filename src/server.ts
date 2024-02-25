import fastify from "fastify";

//* Local imports
import { knex } from "./database";

const app = fastify({ logger: true });

app.get("/", async (request, reply) => {
  const tables = await knex("sqlite_schema").select("*");

  return tables;
});

app.listen({ port: 3000 }).then((address) => {
  console.log(`Server listening on ${address}`);
});
