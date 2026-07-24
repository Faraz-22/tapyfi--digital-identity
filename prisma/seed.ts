import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up any existing data to avoid constraint conflicts during seed resets
  await prisma.ctaButton.deleteMany({});
  await prisma.socialLink.deleteMany({});
  await prisma.profilePhone.deleteMany({});
  await prisma.profileEmail.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Default User (as Owner)
  const user = await prisma.user.create({
    data: {
      id: "usr_demo",
      email: "faraz@tapyfi.com",
      name: "Faraz Khan",
      role: "OWNER",
      passwordHash: "$2a$10$OitfXUiQGvbha4kx.tRX..FB0pr/KRfvgDVCs9QNrPIByRbmWm6cG", // bcrypt hash for 'password123'
    },
  });

  // 2. Create Default Profile
  const profile = await prisma.profile.create({
    data: {
      id: "prof_faraz",
      userId: user.id,
      name: "Faraz Khan",
      slug: "faraz",
      title: "Founder & Product Architect",
      company: "tapyfi",
      bio: "Building elegant identity infrastructure for founders, creators, teams, and premium brands. Tap once, update forever.",
      location: "Mumbai, India",
      website: "https://tapyfi.com",
      avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=480&q=80",
      coverUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80",
      logoUrl: "/assets/tapyfi-mark.svg",
      accent: "#6fffe9",
      secondaryAccent: "#f8c66d",
      theme: "MIDNIGHT",
      layout: "HALO",
      bgStyle: "iridescence",
      bgConfig: '{"red":0.60,"green":0.55,"blue":0.73,"speed":4.0,"intensity":1.9,"mouse":true}',
      published: true,
      emails: {
        create: [
          { value: "hello@tapyfi.com", label: "Work", primary: true },
          { value: "faraz@tapyfi.com", label: "Personal", primary: false },
        ],
      },
      phones: {
        create: [
          { value: "+91 98765 43210", label: "Work", primary: true },
        ],
      },
      links: {
        create: [
          {
            platform: "LinkedIn",
            label: "LinkedIn",
            url: "https://linkedin.com",
            position: 0,
            clicks: 1284,
            enabled: true,
          },
          {
            platform: "Instagram",
            label: "Instagram",
            url: "https://instagram.com",
            position: 1,
            clicks: 936,
            enabled: true,
          },
          {
            platform: "GitHub",
            label: "GitHub",
            url: "https://github.com",
            position: 2,
            clicks: 612,
            enabled: true,
          },
          {
            platform: "WhatsApp",
            label: "WhatsApp",
            url: "https://wa.me/919876543210",
            position: 3,
            clicks: 492,
            enabled: true,
          },
        ],
      },
      ctas: {
        create: [
          {
            label: "Book a strategy call",
            href: "https://cal.com",
            style: "primary",
            position: 0,
          },
          {
            label: "Save contact",
            href: "mailto:hello@tapyfi.com",
            style: "secondary",
            position: 1,
          },
        ],
      },
    },
  });

  console.log("Seeding completed successfully!");
  console.log(`User created: ${user.email} (ID: ${user.id})`);
  console.log(`Profile created: /profile/${profile.slug} (ID: ${profile.id})`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
