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
      displayName: "Amani Uwase",
      bio: "Photographer in Kigali. Weddings, portraits and city stories.",
      links: {
        create: [
          { title: "See my portfolio", url: "https://example.com/portfolio", position: 0 },
          { title: "Instagram", url: "https://instagram.com", position: 1 },
          { title: "Book a photo shoot", url: "https://example.com/book", position: 2 },
          { title: "Email me", url: "mailto:hello@example.com", position: 3 },
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
