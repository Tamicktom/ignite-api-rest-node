//* Libraries imports
import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import z from "zod";

//* Local imports
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

const createTransactionSchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(["credit", "debit"]),
});

const getTransactionSchema = z.object({
  id: z.string().uuid(),
});

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId;

      const transactions = await knex("transactions")
        .where({
          session_id: sessionId,
        })
        .select("*");

      return { transactions };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { id } = getTransactionSchema.parse(request.params);

      const sessionId = request.cookies.sessionId;

      const transaction = await knex("transactions")
        .where({
          id,
          session_id: sessionId,
        })
        .first();

      if (!transaction) {
        return reply.status(404).send({ error: "Transaction not found" });
      }

      return { transaction };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const sessionId = request.cookies.sessionId;

      const summary = await knex("transactions")
        .where({
          session_id: sessionId,
        })
        .sum("amount", {
          as: "amount",
        })
        .first();

      return { summary };
    }
  );

  app.post("/", async (request, reply) => {
    const body = createTransactionSchema.parse(request.body);

    const id = crypto.randomUUID();

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      reply.setCookie("sessionId", sessionId, {
        path: "/",
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    await knex("transactions").insert({
      id,
      title: body.title,
      amount: body.type === "credit" ? body.amount : body.amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send({ id });
  });
}
