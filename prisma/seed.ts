import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "demo@linknest.app" },
    update: {},
    create: {
      email: "demo@linknest.app",
      username: "amani",
      passwordHash,
      displayName: "Amani CEO",
      bio: "Founder & CEO in Kigali. Let's connect and grow together.",
      links: {
        create: [
          { title: "Call me", url: "tel:+250788000000", platform: "phone", position: 0 },
          { title: "Chat on WhatsApp", url: "https://wa.me/250788000000", platform: "whatsapp", position: 1 },
          { title: "LinkedIn", url: "https://linkedin.com", platform: "linkedin", position: 2 },
          { title: "Instagram", url: "https://instagram.com", platform: "instagram", position: 3 },
          { title: "Company website", url: "https://example.com", platform: "website", position: 4 },
          { title: "Email me", url: "mailto:hello@example.com", platform: "email", position: 5 },
        ],
      },
    },
  });

  console.log("Seeded demo user: demo@linknest.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
