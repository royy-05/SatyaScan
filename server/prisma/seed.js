import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const officerPasswordHash = await bcrypt.hash("Officer@123", 10);
  const submitterPasswordHash = await bcrypt.hash("Submitter@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@satyascan.local" },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "APPROVED",
      isActive: true,
    },
    create: {
      email: "admin@satyascan.local",
      name: "System Administrator",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "APPROVED",
      isActive: true,
    },
  });

  const officer = await prisma.user.upsert({
    where: { email: "officer@satyascan.local" },
    update: {
      passwordHash: officerPasswordHash,
      role: "OFFICER",
      status: "APPROVED",
      isActive: true,
    },
    create: {
      email: "officer@satyascan.local",
      name: "Border Officer Vikram",
      passwordHash: officerPasswordHash,
      role: "OFFICER",
      status: "APPROVED",
      isActive: true,
    },
  });

  const submitter = await prisma.user.upsert({
    where: { email: "submitter@satyascan.local" },
    update: {
      passwordHash: submitterPasswordHash,
      role: "SUBMITTER",
      status: "APPROVED",
      isActive: true,
    },
    create: {
      email: "submitter@satyascan.local",
      name: "Agent Submitter",
      passwordHash: submitterPasswordHash,
      role: "SUBMITTER",
      status: "APPROVED",
      isActive: true,
    },
  });

  console.log("Seed successful!");
  console.log("Created/Verified Admin:", admin.email);
  console.log("Created/Verified Officer:", officer.email);
  console.log("Created/Verified Submitter:", submitter.email);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
