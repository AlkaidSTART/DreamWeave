import { prisma } from "@/lib/prisma";

async function main() {
  try {
    await prisma.user.upsert({
      where: { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
      create: {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        username: "test-user",
        email: "test@example.com",
      },
      update: {},
    });
    console.log("success");
  } catch (error) {
    console.error("ERROR CODE:", (error as Error & { code?: string }).code);
    console.error("ERROR MESSAGE:", (error as Error).message);
    console.error("ERROR META:", (error as Error & { meta?: object }).meta);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
