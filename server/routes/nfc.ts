import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { createNfcWritePayload } from "../services/nfc";
import { prisma } from "../prisma";

export const nfcRouter = Router();

const assignmentSchema = z.object({
  profileId: z.string(),
  productId: z.string(),
  active: z.boolean().default(true)
});

// GET /api/nfc/mine — Fetch all active NFC devices claimed by the user's profiles
nfcRouter.get("/mine", requireAuth, async (request, response) => {
  try {
    const user = response.locals.user;
    
    // Find all profiles owned by this user
    const profiles = await prisma.profile.findMany({
      where: { userId: user.id },
      select: { id: true }
    });
    
    const profileIds = profiles.map((p) => p.id);

    const products = await prisma.nfcProduct.findMany({
      where: {
        profileId: { in: profileIds }
      },
      include: {
        profile: {
          select: { name: true, slug: true }
        }
      }
    });

    response.json(products);
  } catch (error: any) {
    console.error("Failed to load user NFC products:", error);
    response.status(500).json({ error: "Failed to load NFC products" });
  }
});

// POST /api/nfc/assign — Claims/Assigns a physical NFC product to a profile
nfcRouter.post("/assign", requireAuth, async (request, response) => {
  try {
    const assignment = assignmentSchema.parse(request.body);
    const user = response.locals.user;

    // Verify ownership of the target profile
    const profile = await prisma.profile.findUnique({
      where: { id: assignment.profileId }
    });

    if (!profile) {
      return response.status(404).json({ error: "Profile not found" });
    }

    if (profile.userId !== user.id && user.role !== "ADMIN" && user.role !== "OWNER") {
      return response.status(403).json({ error: "Access denied. You do not own this profile." });
    }

    const appUrl = process.env.APP_URL || "http://localhost:5173";
    const programmedUrl = `${appUrl}/profile/${profile.slug}`;

    // Upsert the NFC product row
    const existingProduct = await prisma.nfcProduct.findUnique({
      where: { id: assignment.productId }
    });

    let nfcProduct;
    if (existingProduct) {
      nfcProduct = await prisma.nfcProduct.update({
        where: { id: assignment.productId },
        data: {
          profileId: assignment.profileId,
          active: assignment.active,
          assignedAt: new Date(),
          programmedUrl
        }
      });
    } else {
      nfcProduct = await prisma.nfcProduct.create({
        data: {
          id: assignment.productId,
          productSku: "MATTE_BLACK_DEFAULT",
          profileId: assignment.profileId,
          active: assignment.active,
          assignedAt: new Date(),
          programmedUrl
        }
      });
    }

    response.status(201).json(nfcProduct);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return response.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("NFC assignment failed:", error);
    response.status(500).json({ error: "NFC assignment failed" });
  }
});

nfcRouter.post("/write-payload", requireAuth, (request, response) => {
  const body = z.object({ url: z.string().url() }).parse(request.body);
  response.json(createNfcWritePayload(body.url));
});

// PATCH /api/nfc/:id/status — Toggles active state of a user's NFC product
nfcRouter.patch("/:id/status", requireAuth, async (request, response) => {
  try {
    const { id } = request.params;
    const body = z.object({ active: z.boolean() }).parse(request.body);
    const user = response.locals.user;

    const nfcProduct = await prisma.nfcProduct.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!nfcProduct) {
      return response.status(404).json({ error: "NFC product not found" });
    }

    if (nfcProduct.profile && nfcProduct.profile.userId !== user.id && user.role !== "ADMIN" && user.role !== "OWNER") {
      return response.status(403).json({ error: "Access denied. You do not own this NFC product." });
    }

    const updated = await prisma.nfcProduct.update({
      where: { id },
      data: { active: body.active }
    });

    response.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return response.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("NFC status update failed:", error);
    response.status(500).json({ error: "NFC status update failed" });
  }
});
