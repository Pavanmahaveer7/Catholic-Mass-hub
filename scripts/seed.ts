import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import pilgrimages from "../content/seeds/pilgrimages.json";
import streams from "../content/seeds/online-streams.json";

type SeedSite = (typeof pilgrimages)[number];

async function main() {
  const now = new Date();

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@catholicmasshub.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme-admin";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin", passwordHash: adminHash },
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash: adminHash,
      role: "admin",
      locale: "en",
    },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  for (const site of pilgrimages as SeedSite[]) {
    const yearlySchedule =
      "yearlySchedule" in site && Array.isArray(site.yearlySchedule)
        ? JSON.stringify(site.yearlySchedule)
        : "[]";

    const payload = {
      name: site.name,
      country: site.country,
      region: site.region,
      latitude: site.latitude,
      longitude: site.longitude,
      description: site.description,
      significance: site.significance,
      bestSeason: site.bestSeason,
      peakEvents: JSON.stringify(site.peakEvents),
      yearlySchedule,
      massScheduleNotes: site.massScheduleNotes,
      processionTimes: site.processionTimes,
      howToReach: JSON.stringify(site.howToReach),
      officialUrl: site.officialUrl,
      livestreamUrl: site.livestreamUrl,
      lastVerifiedAt: now,
    };

    await prisma.pilgrimageSite.upsert({
      where: { slug: site.slug },
      update: payload,
      create: { slug: site.slug, ...payload },
    });
  }

  // Refresh streams completely so Watch Online stays current with seed file
  await prisma.onlineStream.deleteMany();
  for (const stream of streams) {
    await prisma.onlineStream.create({
      data: {
        ...stream,
        verifiedAt: now,
      },
    });
  }

  const teachings = [
    {
      slug: "creed",
      title: "The Creed",
      source: "Catechism of the Council of Trent",
      description: "The twelve articles of the Apostles' Creed explained.",
      sortOrder: 1,
      chapters: JSON.stringify([
        "I believe in God the Father",
        "And in Jesus Christ, His Son",
        "The Holy Catholic Church",
        "Life everlasting",
      ]),
    },
    {
      slug: "sacraments",
      title: "The Sacraments",
      source: "Catechism of the Council of Trent",
      description: "Baptism, Confirmation, Eucharist, Penance, and more.",
      sortOrder: 2,
      chapters: JSON.stringify([
        "Baptism",
        "Confirmation",
        "The Holy Eucharist",
        "Penance",
        "Extreme Unction",
        "Holy Orders",
        "Matrimony",
      ]),
    },
    {
      slug: "commandments",
      title: "The Commandments",
      source: "Catechism of the Council of Trent",
      description: "The Ten Commandments and moral life.",
      sortOrder: 3,
      chapters: JSON.stringify([
        "First Commandment",
        "Second Commandment",
        "Third Commandment",
        "Fourth Commandment",
        "Fifth Commandment",
      ]),
    },
    {
      slug: "prayer",
      title: "Prayer",
      source: "Catechism of the Council of Trent",
      description: "The Lord's Prayer, Hail Mary, and devotional life.",
      sortOrder: 4,
      chapters: JSON.stringify([
        "The Lord's Prayer",
        "The Hail Mary",
        "The Rosary",
        "Morning and Evening Prayer",
      ]),
    },
    {
      slug: "baltimore",
      title: "Baltimore Catechism",
      source: "Baltimore Catechism No. 2",
      description: "Classic Q&A catechesis for beginners.",
      sortOrder: 5,
      chapters: JSON.stringify([
        "Lesson 1: Purpose of Man",
        "Lesson 2: God and Creation",
        "Lesson 3: Unity and Trinity",
        "Lesson 4: Creation and Angels",
        "Lesson 5: Providence",
      ]),
    },
  ];

  for (const section of teachings) {
    await prisma.teachingSection.upsert({
      where: { slug: section.slug },
      update: {
        title: section.title,
        source: section.source,
        description: section.description,
        sortOrder: section.sortOrder,
        chapters: section.chapters,
      },
      create: section,
    });
  }

  await prisma.localPlace.upsert({
    where: { slug: "demo-catholic-bookstore" },
    update: {
      status: "approved",
      name: "St. Benedict Catholic Bookstore (Demo)",
      description: "Books, rosaries, and religious gifts near the cathedral.",
      approvedAt: now,
    },
    create: {
      slug: "demo-catholic-bookstore",
      status: "approved",
      name: "St. Benedict Catholic Bookstore (Demo)",
      category: "bookstore",
      description: "Books, rosaries, and religious gifts near the cathedral.",
      addressCity: "Chicago",
      addressRegion: "IL",
      country: "United States",
      latitude: 41.8781,
      longitude: -87.6298,
      featured: true,
      amenities: JSON.stringify(["family_friendly", "near_parish"]),
      approvedAt: now,
    },
  });

  console.log(
    `Seed complete at ${now.toISOString()} — ${pilgrimages.length} pilgrimages, ${streams.length} streams refreshed.`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
