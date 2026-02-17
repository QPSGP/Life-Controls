const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

// Only two tiers: SOVEREIGN: Personal ($25) and SOVEREIGN: Business ($250)
const defaultPlans = [
  { name: "SOVEREIGN: Personal", slug: "sovereign-personal", amountCents: 2500, interval: "monthly", sortOrder: 1 },
  { name: "SOVEREIGN: Business", slug: "sovereign-business", amountCents: 25000, interval: "monthly", sortOrder: 2 },
];
const keepSlugs = defaultPlans.map((p) => p.slug);

async function main() {
  const defaultUserEmail = "admin@sovereign-life-plan.local";
  const defaultUserHash = await bcrypt.hash("changeme", 10);
  await prisma.user.upsert({
    where: { email: defaultUserEmail },
    update: {},
    create: {
      email: defaultUserEmail,
      passwordHash: defaultUserHash,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    },
  });
  console.log("Seeded default user (Life Plan owner):", defaultUserEmail);

  // Remove any plan not in our two tiers (only deletes if no subscriptions reference it)
  const toRemove = await prisma.subscriptionPlan.findMany({
    where: { slug: { notIn: keepSlugs } },
    select: { id: true, slug: true },
  });
  for (const plan of toRemove) {
    try {
      await prisma.subscriptionPlan.delete({ where: { id: plan.id } });
      console.log("Removed old plan:", plan.slug);
    } catch (e) {
      // Plan still in use by subscriptions; skip
    }
  }
  for (const plan of defaultPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: { name: plan.name, amountCents: plan.amountCents, interval: plan.interval, sortOrder: plan.sortOrder },
      create: plan,
    });
  }
  console.log("Seeded subscription plans:", defaultPlans.map((p) => p.name).join(", "));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
