import fastify from "fastify";
import cookie from "@fastify/cookie";

//* Routes
import { transactionsRoutes } from "./routes/transactions";

const app = fastify({ logger: true });

app.register(cookie);
app.register(transactionsRoutes, { prefix: "/transactions" });

export { app };
