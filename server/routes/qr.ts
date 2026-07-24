import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

export const qrRouter = Router();

qrRouter.post("/", requireAuth, (request, response) => {
  const body = z
    .object({
      profileId: z.string(),
      accent: z.string().default("#6fffe9"),
      branded: z.boolean().default(true)
    })
    .parse(request.body);

  response.status(201).json({
    id: "qr_new",
    ...body,
    downloadFormats: ["png", "svg"],
    dynamic: true
  });
});
