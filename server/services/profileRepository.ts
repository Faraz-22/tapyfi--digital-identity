import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const publicProfileInclude = {
  emails: true,
  phones: true,
  links: { orderBy: { position: "asc" as const } },
  ctas: { orderBy: { position: "asc" as const } },
  sections: { orderBy: { position: "asc" as const } },
  qrCodes: true,
  nfcProducts: true
};

export async function getPublicProfileByIdentifier(identifier: string) {
  return prisma.profile.findFirst({
    where: {
      published: true,
      OR: [{ id: identifier }, { slug: identifier }]
    },
    include: publicProfileInclude
  });
}

export async function saveProfileWithLinks(input: {
  id?: string;
  userId: string;
  name: string;
  slug: string;
  title?: string;
  company?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  coverUrl?: string;
  logoUrl?: string;
  accent?: string;
  secondaryAccent?: string;
  links?: Array<{
    id?: string;
    platform: string;
    label: string;
    url: string;
    enabled: boolean;
    position: number;
  }>;
}) {
  return prisma.$transaction(async (tx) => {
    const profile = input.id
      ? await tx.profile.update({
          where: { id: input.id },
          data: {
            name: input.name,
            slug: input.slug,
            title: input.title,
            company: input.company,
            bio: input.bio,
            location: input.location,
            website: input.website,
            avatarUrl: input.avatarUrl,
            coverUrl: input.coverUrl,
            logoUrl: input.logoUrl,
            accent: input.accent,
            secondaryAccent: input.secondaryAccent
          }
        })
      : await tx.profile.create({
          data: {
            userId: input.userId,
            name: input.name,
            slug: input.slug,
            title: input.title,
            company: input.company,
            bio: input.bio,
            location: input.location,
            website: input.website,
            avatarUrl: input.avatarUrl,
            coverUrl: input.coverUrl,
            logoUrl: input.logoUrl,
            accent: input.accent,
            secondaryAccent: input.secondaryAccent
          }
        });

    if (input.links) {
      await tx.socialLink.deleteMany({ where: { profileId: profile.id } });
      await tx.socialLink.createMany({
        data: input.links.map((link, index) => ({
          profileId: profile.id,
          platform: link.platform,
          label: link.label,
          url: link.url,
          enabled: link.enabled,
          position: link.position ?? index
        }))
      });
    }

    return tx.profile.findUniqueOrThrow({
      where: { id: profile.id },
      include: publicProfileInclude
    });
  });
}
