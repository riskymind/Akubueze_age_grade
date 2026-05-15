import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  console.log("Connecting to database...");

  const userCount = await prisma.user.count();
  const meetingCount = await prisma.meeting.count();

  console.log(`✓ Connected to: ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0]}`);
  console.log(`✓ Users: ${userCount}`);
  console.log(`✓ Meetings: ${meetingCount}`);

  await prisma.$disconnect();
  console.log("✓ Database connection test passed.");
}

main().catch((err) => {
  console.error("✗ Database connection test failed:", err);
  process.exit(1);
});
