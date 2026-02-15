import bcrypt from "bcryptjs";
import {prisma} from "../src/config/db.js";

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
  const hasheddPassword = await bcrypt.hash(adminPassword, 10);

  // Création de l'admin
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hasheddPassword,
      role: "ADMIN"
    },
  });

  console.log("✅ Admin user created successfully");

   console.log('🗺️ Seeding regions and cities...');

  const regions = [
    { name: 'Casablanca-Settat', cities: ['Casablanca', 'Mohammedia', 'El Jadida', 'Settat', 'Berrechid'] },
    { name: 'Rabat-Salé-Kénitra', cities: ['Rabat', 'Salé', 'Kénitra', 'Témara'] },
    { name: 'Marrakech-Safi', cities: ['Marrakech', 'Safi', 'Essaouira'] },
    { name: 'Fès-Meknès', cities: ['Fès', 'Meknès'] },
    { name: 'Tanger-Tétouan-Al Hoceïma', cities: ['Tanger', 'Tétouan', 'Al Hoceïma'] },
    { name: 'Souss-Massa', cities: ['Agadir', 'Taroudant'] },
  ];

  for (const regionData of regions) {

    // Create or update region
    const region = await prisma.region.upsert({
      where: { name: regionData.name },
      update: {},
      create: {
        name: regionData.name
      }
    });

    // Create cities linked to region
    for (const cityName of regionData.cities) {

      await prisma.city.upsert({
        where: {
          name_region_id: {
            name: cityName,
            region_id: region.region_id
          }
        },
        update: {},
        create: {
          name: cityName,
          region_id: region.region_id
        }
      });

    }

  }

  console.log('✅ Regions and cities seeded successfully!');



  
console.log("🌱 Seeding specialities...");

  const specialities = [
    "Développement Web",
    "Développement Mobile",
    "UI/UX Design",
    "Marketing Digital",
    "Community Management",
    "Réseaux Informatiques",
    "Cybersécurité",
    "Data Science",
    "Intelligence Artificielle",
    "Gestion de Projet",
    "Comptabilité",
    "Finance",
    "Ressources Humaines",
    "Communication",
    "Graphisme",
    "Montage Vidéo",
    "Rédaction de contenu",
    "SEO",
    "Support IT",
    "DevOps"
  ];

  for (const name of specialities) {

    await prisma.speciality.upsert({
      where: { name },
      update: {},
      create: { name }
    });

  }

  console.log("✅ Specialities seeded successfully");
  // ⚠️ Change ces valeurs si tu veux
  const workerEmail = "worker@test.com";
  const establishmentEmail = "establishment@test.com";
  const plainPassword = "Test12345"; // mot de passe seed

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // ---------------- WORKER ----------------
  const workerUser = await prisma.user.upsert({
    where: { email: workerEmail },
    update: {},
    create: {
      email: workerEmail,
      password: hashedPassword,
      role: "WORKER",
      email_verified: true, // pratique pour tester login direct
      workerProfile: {
        create: {
          first_name: "Youssef",
          last_name: "Worker",
          phone: "0612345678",
          verification_status: "VERIFIED", // ou PENDING si tu veux tester blocage
        },
      },
    },
    select: { user_id: true, email: true, role: true },
  });

  // ---------------- ESTABLISHMENT ----------------
  const establishmentUser = await prisma.user.upsert({
    where: { email: establishmentEmail },
    update: {},
    create: {
      email: establishmentEmail,
      password: hashedPassword,
      role: "ESTABLISHMENT",
      email_verified: true,
      establishmentProfile: {
        create: {
          name: "Association Entraide",
          contact_first_name: "Ahmed",
          contact_last_name: "Benali",
          phone: "0672666769",
          ice_number: "001234567000089", // doit être UNIQUE
          verification_status: "VERIFIED", // ou PENDING
        },
      },
    },
    select: { user_id: true, email: true, role: true },
  });

  console.log("✅ Seeded accounts:");
  console.log("Worker:", workerUser);
  console.log("Establishment:", establishmentUser);
  console.log("🔑 Password for both:", plainPassword);

}


main()
  .catch((e) => {
    console.error(" Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
