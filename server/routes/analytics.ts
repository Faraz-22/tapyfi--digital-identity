import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";

export const analyticsRouter = Router();

const eventSchema = z.object({
  profileId: z.string(),
  type: z.enum(["NFC_TAP", "QR_SCAN", "LINK_CLICK", "PROFILE_VIEW"]),
  linkId: z.string().optional(),
  qrCodeId: z.string().optional(),
  nfcProductId: z.string().optional(),
  device: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional()
});

// Helper: extract basic device/browser info from User-Agent header
function parseUserAgent(ua?: string) {
  if (!ua) return { device: "unknown", browser: "unknown", os: "unknown" };

  let device = "Desktop";
  if (/mobile|android|iphone|ipad/i.test(ua)) {
    device = /iphone|ipad/i.test(ua) ? "iOS" : "Android";
  }

  let browser = "Other";
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edg/i.test(ua)) browser = "Edge";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

// POST /api/analytics/events — Log a real analytics event to the database
analyticsRouter.post("/events", async (request, response) => {
  try {
    const data = eventSchema.parse(request.body);
    const uaInfo = parseUserAgent(request.headers["user-agent"]);

    const event = await prisma.analyticsEvent.create({
      data: {
        profileId: data.profileId,
        type: data.type,
        linkId: data.linkId || null,
        qrCodeId: data.qrCodeId || null,
        nfcProductId: data.nfcProductId || null,
        device: data.device || uaInfo.device,
        browser: uaInfo.browser,
        os: uaInfo.os,
        country: data.country || null,
        city: data.city || null
      }
    });

    response.status(202).json({ id: event.id, receivedAt: event.createdAt.toISOString() });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return response.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Analytics event error:", error);
    response.status(500).json({ error: "Failed to log event" });
  }
});

// GET /api/analytics/profiles/:profileId/summary — Aggregate real analytics data
analyticsRouter.get("/profiles/:profileId/summary", async (request, response) => {
  try {
    const { profileId } = request.params;

    // Verify profile exists
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      return response.status(404).json({ error: "Profile not found" });
    }

    // Count events by type
    const allEvents = await prisma.analyticsEvent.findMany({
      where: { profileId },
      select: { type: true, device: true, city: true }
    });

    let taps = 0;
    let scans = 0;
    let clicks = 0;
    let views = 0;
    const deviceCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};

    for (const event of allEvents) {
      switch (event.type) {
        case "NFC_TAP": taps++; break;
        case "QR_SCAN": scans++; break;
        case "LINK_CLICK": clicks++; break;
        case "PROFILE_VIEW": views++; break;
      }

      // Aggregate devices
      const dev = event.device || "unknown";
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;

      // Aggregate cities
      if (event.city) {
        cityCounts[event.city] = (cityCounts[event.city] || 0) + 1;
      }
    }

    // Calculate device percentages
    const total = allEvents.length || 1;
    const devices: Record<string, number> = {};
    for (const [key, count] of Object.entries(deviceCounts)) {
      devices[key.toLowerCase()] = Math.round((count / total) * 100);
    }

    // Get top cities (sorted by count, top 5)
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city]) => city);

    response.json({
      profileId,
      taps,
      scans,
      clicks,
      views,
      totalEvents: allEvents.length,
      devices,
      topCities
    });
  } catch (error: any) {
    console.error("Analytics summary error:", error);
    response.status(500).json({ error: "Failed to compute analytics summary" });
  }
});
