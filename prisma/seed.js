import bcrypt from "bcryptjs";
import prisma from "../src/config/db.js";

async function main() {
  const adminEmail = "admin@socialink.com";
  const adminPassword = "test1234";

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(" Admin already exists");
    return;
  }

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Création de l'admin
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      verification_status: "APPROVED", // admin toujours validé
    },
  });

  console.log("✅ Admin user created successfully");
}

main()
  .catch((e) => {
    console.error(" Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
