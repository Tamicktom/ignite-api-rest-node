import fastify from "fastify";

//* Local imports
import { env } from "./env";

//* Routes
import { transactionsRoutes } from "./routes/transactions";

const app = fastify({ logger: true });

app.register(transactionsRoutes, { prefix: "/transactions" });

app.listen({ port: env.PORT }).then((address) => {
  console.log(`Server listening on ${address}`);
});
