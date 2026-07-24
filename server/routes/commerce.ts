import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { createCheckoutIntent } from "../services/payments";

export const commerceRouter = Router();

commerceRouter.get("/products", (_request, response) => {
  response.json({ source: "Prisma Product table", products: [] });
});

commerceRouter.post("/checkout", requireAuth, async (request, response) => {
  const body = z
    .object({
      provider: z.enum(["stripe", "razorpay"]),
      currency: z.string().default("INR"),
      amount: z.number().positive(),
      orderId: z.string()
    })
    .parse(request.body);

  response.json(await createCheckoutIntent(body));
});

commerceRouter.get("/orders/:id", requireAuth, (request, response) => {
  response.json({
    id: request.params.id,
    status: "IN_PRODUCTION",
    tracking: "Design approved, NFC URL assigned, print queued."
  });
});
