import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

export const profileRouter = Router();

// Zod schemas for validation
const linkSchema = z.object({
  id: z.string().optional(),
  platform: z.string(),
  label: z.string(),
  url: z.string(),
  enabled: z.boolean().default(true),
  clicks: z.number().default(0)
});

const ctaSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  href: z.string(),
  style: z.enum(["primary", "secondary"]).default("primary")
});

const profileSaveSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(2),
  title: z.string().default(""),
  company: z.string().default(""),
  bio: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  avatar: z.string().default(""),
  cover: z.string().default(""),
  logo: z.string().default(""),
  accent: z.string().default("#6fffe9"),
  secondaryAccent: z.string().default("#f8c66d"),
  theme: z.string().default("midnight"),
  layout: z.string().default("halo"),
  bgStyle: z.string().default("gradient"),
  bgConfig: z.string().default("{}"),
  directRedirectUrl: z.string().optional().nullable().default(null),
  emails: z.array(z.string()).default([]),
  phones: z.array(z.string()).default([]),
  links: z.array(linkSchema).default([]),
  ctas: z.array(ctaSchema).default([])
});

// Helper to map DB profile format to frontend Profile type
function mapDbProfileToFrontend(dbProfile: any) {
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    slug: dbProfile.slug,
    title: dbProfile.title || "",
    company: dbProfile.company || "",
    bio: dbProfile.bio || "",
    location: dbProfile.location || "",
    website: dbProfile.website || "",
    avatar: dbProfile.avatarUrl || "",
    cover: dbProfile.coverUrl || "",
    logo: dbProfile.logoUrl || "",
    accent: dbProfile.accent,
    secondaryAccent: dbProfile.secondaryAccent,
    theme: dbProfile.theme.toLowerCase(),
    layout: dbProfile.layout.toLowerCase(),
    bgStyle: dbProfile.bgStyle || "gradient",
    bgConfig: dbProfile.bgConfig || "{}",
    directRedirectUrl: dbProfile.directRedirectUrl || null,
    phones: dbProfile.phones.map((p: any) => p.value),
    emails: dbProfile.emails.map((e: any) => e.value),
    ctas: dbProfile.ctas.map((c: any) => ({
      id: c.id,
      label: c.label,
      href: c.href,
      style: c.style
    })),
    links: dbProfile.links.map((l: any) => ({
      id: l.id,
      platform: l.platform,
      label: l.label,
      url: l.url,
      clicks: l.clicks,
      enabled: l.enabled
    }))
  };
}

// 1. GET /api/profiles/mine — Fetch or create authenticated user's own profile
profileRouter.get("/mine", requireAuth, async (request, response) => {
  const user = response.locals.user;
  try {
    let dbProfile = await prisma.profile.findFirst({
      where: { userId: user.id },
      include: {
        emails: true,
        phones: true,
        links: { orderBy: { position: "asc" } },
        ctas: { orderBy: { position: "asc" } },
        sections: { orderBy: { position: "asc" } }
      }
    });

    if (!dbProfile) {
      // Query the database to retrieve user's name, as JWT payload only has ID/email
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      if (!dbUser) {
        return response.status(404).json({ error: "User not found" });
      }

      const userName = dbUser.name || "Identity User";

      // Generate a unique slug based on user's name
      let slug = userName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (!slug || slug.length < 2) {
        slug = "profile";
      }
      const existing = await prisma.profile.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      dbProfile = await prisma.profile.create({
        data: {
          name: userName,
          slug,
          userId: user.id,
          title: "Professional Profile",
          bio: "Welcome to my digital identity card.",
          accent: "#6fffe9",
          secondaryAccent: "#f8c66d",
          theme: "MIDNIGHT",
          layout: "HALO"
        },
        include: {
          emails: true,
          phones: true,
          links: true,
          ctas: true,
          sections: true
        }
      });
    }

    response.json(mapDbProfileToFrontend(dbProfile));
  } catch (error: any) {
    console.error("Error fetching user's own profile:", error);
    response.status(500).json({ error: "Failed to load user profile" });
  }
});

// 2. GET profile by slug or ID
profileRouter.get("/:identifier", async (request, response) => {
  const { identifier } = request.params;
  try {
    let dbProfile = await prisma.profile.findUnique({
      where: { slug: identifier },
      include: {
        emails: true,
        phones: true,
        links: { orderBy: { position: "asc" } },
        ctas: { orderBy: { position: "asc" } },
        sections: { orderBy: { position: "asc" } }
      }
    });

    if (!dbProfile) {
      // Fallback: search by id
      dbProfile = await prisma.profile.findUnique({
        where: { id: identifier },
        include: {
          emails: true,
          phones: true,
          links: { orderBy: { position: "asc" } },
          ctas: { orderBy: { position: "asc" } },
          sections: { orderBy: { position: "asc" } }
        }
      });
    }

    if (!dbProfile) {
      return response.status(404).json({ error: "Profile not found" });
    }

    const viewsCount = await prisma.analyticsEvent.count({
      where: {
        profileId: dbProfile.id,
        type: "PROFILE_VIEW"
      }
    });

    const mapped = mapDbProfileToFrontend(dbProfile);
    response.json({
      ...mapped,
      viewsCount
    });
  } catch (error: any) {
    console.error(`Error fetching profile for identifier "${identifier}":`, error);
    response.status(500).json({ error: "Failed to get profile" });
  }
});

// 2. PUT profile by slug (the main save/autosave endpoint)
profileRouter.put("/:slug", requireAuth, async (request, response) => {
  const { slug } = request.params;
  const user = response.locals.user;

  try {
    const data = profileSaveSchema.parse(request.body);

    // Find the profile to be updated
    let profile = await prisma.profile.findUnique({
      where: { slug }
    });

    // Fallback: search by id if slug changed or is not yet resolved
    if (!profile && data.id) {
      profile = await prisma.profile.findUnique({
        where: { id: data.id }
      });
    }

    if (profile && profile.userId !== user.id && user.role !== "ADMIN" && user.role !== "OWNER") {
      return response.status(403).json({ error: "Access denied. You do not own this profile." });
    }

    if (!profile) {
      // If no profile exists, let's create a new one under the logged-in user
      profile = await prisma.profile.create({
        data: {
          name: data.name,
          slug: data.slug,
          userId: user.id,
          accent: data.accent,
          secondaryAccent: data.secondaryAccent,
          theme: data.theme.toUpperCase(),
          layout: data.layout.toUpperCase()
        }
      });
    }

    const profileId = profile.id;

    // Check if the new slug is already taken by another profile
    const existingWithSlug = await prisma.profile.findFirst({
      where: {
        slug: data.slug,
        id: { not: profileId }
      }
    });
    if (existingWithSlug) {
      return response.status(400).json({ error: `The custom link "/profile/${data.slug}" is already taken.` });
    }

    // Use transaction to perform atomic bulk replacement for related tables
    const updatedDbProfile = await prisma.$transaction(async (tx) => {
      // Update basic fields
      await tx.profile.update({
        where: { id: profileId },
        data: {
          name: data.name,
          slug: data.slug,
          title: data.title,
          company: data.company,
          bio: data.bio,
          location: data.location,
          website: data.website,
          avatarUrl: data.avatar,
          coverUrl: data.cover,
          logoUrl: data.logo,
          accent: data.accent,
          secondaryAccent: data.secondaryAccent,
          theme: data.theme.toUpperCase(),
          layout: data.layout.toUpperCase(),
          bgStyle: data.bgStyle,
          bgConfig: data.bgConfig,
          directRedirectUrl: data.directRedirectUrl || null
        }
      });

      // Update emails (recreate list)
      await tx.profileEmail.deleteMany({ where: { profileId } });
      if (data.emails.length > 0) {
        await tx.profileEmail.createMany({
          data: data.emails.map((value, idx) => ({
            profileId,
            value,
            primary: idx === 0,
            label: idx === 0 ? "Work" : "Personal"
          }))
        });
      }

      // Update phones (recreate list)
      await tx.profilePhone.deleteMany({ where: { profileId } });
      if (data.phones.length > 0) {
        await tx.profilePhone.createMany({
          data: data.phones.map((value, idx) => ({
            profileId,
            value,
            primary: idx === 0,
            label: idx === 0 ? "Work" : "Mobile"
          }))
        });
      }

      // Update social links (recreate list)
      await tx.socialLink.deleteMany({ where: { profileId } });
      if (data.links.length > 0) {
        await tx.socialLink.createMany({
          data: data.links.map((link, idx) => ({
            profileId,
            platform: link.platform,
            label: link.label,
            url: link.url,
            enabled: link.enabled,
            position: idx,
            clicks: link.clicks
          }))
        });
      }

      // Update CTAs (recreate list)
      await tx.ctaButton.deleteMany({ where: { profileId } });
      if (data.ctas.length > 0) {
        await tx.ctaButton.createMany({
          data: data.ctas.map((cta, idx) => ({
            profileId,
            label: cta.label,
            href: cta.href,
            style: cta.style,
            position: idx
          }))
        });
      }

      // Retrieve the newly updated full profile
      return tx.profile.findUnique({
        where: { id: profileId },
        include: {
          emails: true,
          phones: true,
          links: { orderBy: { position: "asc" } },
          ctas: { orderBy: { position: "asc" } },
          sections: { orderBy: { position: "asc" } }
        }
      });
    });

    response.json(mapDbProfileToFrontend(updatedDbProfile));
  } catch (error: any) {
    console.error("Error updating profile:", error);
    response.status(500).json({ error: "Failed to save profile", details: error.message });
  }
});
