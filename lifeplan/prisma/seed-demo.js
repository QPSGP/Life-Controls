/**
 * Optional demo seed: populates two full demo members with a month of data each.
 * - Demo Personal (demo@sovereign-life-plan.local / demo1234) — Personal plan, category Personal.
 * - Demo Business (demo-business@sovereign-life-plan.local / fact4567) — Business plan, categories Agency + MMPE4.
 * Run after main seed: npm run db:seed && npm run db:seed:demo
 * Idempotent: if demo member (demo@sovereign-life-plan.local) already exists, skips. To refresh: delete both demo members then re-run.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const DEMO_MEMBER_EMAIL = "demo@sovereign-life-plan.local";

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  const existing = await prisma.member.findFirst({ where: { email: DEMO_MEMBER_EMAIL } });
  if (existing) {
    console.log("Demo data already present (member " + DEMO_MEMBER_EMAIL + " exists). Skipping.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: "admin@sovereign-life-plan.local" } });
  if (!user) {
    console.log("Run main seed first (npm run db:seed). No default user found.");
    return;
  }

  const plans = await prisma.subscriptionPlan.findMany({ where: { slug: { in: ["sovereign-personal", "sovereign-business"] } }, orderBy: { sortOrder: "asc" } });
  const personalPlan = plans.find((p) => p.slug === "sovereign-personal") || plans[0];
  if (!personalPlan) {
    console.log("No subscription plan found. Run main seed first.");
    return;
  }

  const hash = await bcrypt.hash("demo1234", 10);
  const member = await prisma.member.create({
    data: {
      email: DEMO_MEMBER_EMAIL,
      passwordHash: hash,
      firstName: "Demo Personal",
      lastName: "",
      title: "Personal tier demo",
      company: "Demo Personal",
      street: "100 Main St, Suite 200",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "USA",
      phone: "555-0100",
      notes: "Full demo – Personal plan, one month of sample data.",
    },
  });
  await prisma.memberCategory.create({ data: { memberId: member.id, category: "Personal" } });
  console.log("Created demo member (fact data):", member.email, "— Demo Personal");

  const businessPlan = plans.find((p) => p.slug === "sovereign-business");
  const hash2 = await bcrypt.hash("fact4567", 10);
  const member2 = await prisma.member.create({
    data: {
      email: "demo-business@sovereign-life-plan.local",
      passwordHash: hash2,
      firstName: "Demo Business",
      lastName: "",
      title: "Business tier demo",
      company: "Demo Business",
      street: "4500 Oak Blvd",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      country: "USA",
      phone: "555-0200",
      notes: "Full demo – Business plan, one month of sample data.",
    },
  });
  await prisma.memberCategory.create({ data: { memberId: member2.id, category: "Agency" } });
  await prisma.memberCategory.create({ data: { memberId: member2.id, category: "MMPE4" } });
  console.log("Created second member (fact data):", member2.email, "— Demo Business");

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  await prisma.subscription.create({
    data: {
      memberId: member.id,
      subscriptionPlanId: personalPlan.id,
      status: "active",
      currentPeriodEnd: periodEnd,
    },
  });
  await prisma.subscription.create({
    data: {
      memberId: member2.id,
      subscriptionPlanId: businessPlan ? businessPlan.id : personalPlan.id,
      status: "active",
      currentPeriodEnd: periodEnd,
    },
  });
  console.log("Created subscriptions for both members.");

  const subject = await prisma.subjectBusiness.create({
    data: {
      userId: user.id,
      memberId: member.id,
      name: "Demo Life Plan",
      verb: "Build",
      noun: "life",
      object: "plan",
      objective: "Clarity and focus",
    },
  });
  const purpose = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject.id,
      name: "Health & energy",
      verb: "Maintain",
      noun: "health",
      object: "daily habits",
      objective: "Sustain energy",
    },
  });
  const responsibility = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose.id,
      name: "Daily movement",
      verb: "Complete",
      noun: "movement",
      object: "routine",
      objective: "30 min daily",
    },
  });
  await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility.id,
      verb: "Walk",
      noun: "steps",
      object: "10k",
      objective: "Hit step goal",
      results: "Averaged 9.2k last week.",
      done: true,
      doneAt: daysAgo(7),
    },
  });
  const purpose2 = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject.id,
      name: "Family & relationships",
      verb: "Nurture",
      noun: "connections",
      object: "quality time",
      objective: "Weekly check-ins",
    },
  });
  const responsibility2 = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose2.id,
      name: "Family dinner",
      verb: "Host",
      noun: "dinner",
      object: "Sunday evening",
      objective: "Once per week",
    },
  });
  const movement1b = await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility2.id,
      verb: "Block",
      noun: "calendar",
      object: "Sunday 5–7pm",
      objective: "No other commitments",
      results: null,
    },
  });
  await prisma.physicalMovement.update({ where: { id: movement1b.id }, data: { done: true, doneAt: daysAgo(3) } });
  const purpose3 = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject.id,
      name: "Learning & growth",
      verb: "Complete",
      noun: "course",
      object: "life plan workbook",
      objective: "One module per week",
    },
  });
  const responsibility3 = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose3.id,
      name: "Reading",
      verb: "Read",
      noun: "chapter",
      object: "before Friday",
      objective: "Stay on track",
    },
  });
  await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility3.id,
      verb: "Log",
      noun: "progress",
      object: "in portal",
      objective: "Weekly check-in",
      results: null,
    },
  });
  console.log("Created demo life plan for Demo Personal (subject + 3 purposes, responsibilities & movements; some done).");

  const subject2 = await prisma.subjectBusiness.create({
    data: {
      userId: user.id,
      memberId: member2.id,
      name: "Demo Business Life Plan",
      verb: "Scale",
      noun: "practice",
      object: "client impact",
      objective: "Sustainable growth",
    },
  });
  const purpose2m2 = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject2.id,
      name: "Client delivery & retention",
      verb: "Deliver",
      noun: "value",
      object: "on commitments",
      objective: "95% retention",
    },
  });
  const responsibility2m2 = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose2m2.id,
      name: "Quarterly business reviews",
      verb: "Conduct",
      noun: "QBR",
      object: "with each client",
      objective: "Per quarter",
    },
  });
  await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility2m2.id,
      verb: "Schedule",
      noun: "review",
      object: "calls",
      objective: "By end of month",
      results: "Q1 QBRs on calendar.",
      done: true,
      doneAt: daysAgo(14),
    },
  });
  const purpose2m2b = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject2.id,
      name: "Team & operations",
      verb: "Run",
      noun: "operations",
      object: "smoothly",
      objective: "Clear roles, no bottlenecks",
    },
  });
  const responsibility2m2b = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose2m2b.id,
      name: "Weekly team sync",
      verb: "Lead",
      noun: "meeting",
      object: "agenda & notes",
      objective: "Every Monday 9am",
    },
  });
  await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility2m2b.id,
      verb: "Send",
      noun: "agenda",
      object: "24h in advance",
      objective: "So team can prep",
      results: null,
    },
  });
  const purpose2m2c = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject2.id,
      name: "Marketing & outreach",
      verb: "Publish",
      noun: "newsletter",
      object: "monthly",
      objective: "Stay visible to clients",
    },
  });
  const responsibility2m2c = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose2m2c.id,
      name: "Content calendar",
      verb: "Plan",
      noun: "topics",
      object: "quarter ahead",
      objective: "No last-minute rush",
    },
  });
  await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility2m2c.id,
      verb: "Draft",
      noun: "next issue",
      object: "by 15th",
      objective: "Newsletter on time",
      results: "Q2 themes outlined.",
      done: true,
      doneAt: daysAgo(8),
    },
  });
  console.log("Created demo life plan for Demo Business (subject + 3 purposes, responsibilities & movements; some done).");

  const mp1 = await prisma.memberPlan.create({
    data: { memberId: member.id, subjectBusiness: "Demo Personal", areasOfPurpose: "Health; Family; Learning", areasOfResponsibility: "Movement; Family dinner; Reading", sortOrder: 0 },
  });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp1.id, verb: "Walk", noun: "steps", object: "10k", objective: "Daily", done: true, doneAt: daysAgo(1) } });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp1.id, verb: "Block", noun: "Sunday", object: "5–7pm", objective: "Family dinner", done: false } });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp1.id, verb: "Log", noun: "progress", object: "in portal", objective: "Weekly", done: false } });
  const mp2 = await prisma.memberPlan.create({
    data: { memberId: member2.id, subjectBusiness: "Demo Business", areasOfPurpose: "Client delivery; Operations; Marketing", areasOfResponsibility: "QBRs; Team sync; Content", sortOrder: 0 },
  });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp2.id, verb: "Send", noun: "agenda", object: "24h ahead", objective: "Monday sync", done: true, doneAt: daysAgo(2) } });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp2.id, verb: "Conduct", noun: "QBR", object: "with top 3 clients", objective: "This quarter", done: false } });
  await prisma.memberPlanTask.create({ data: { memberPlanId: mp2.id, verb: "Draft", noun: "newsletter", object: "by 15th", objective: "Monthly", done: false } });
  console.log("Created MemberPlan + tasks for both members.");

  // ~1 month of communications for each member (spread over 30 days)
  const comms = [
    { memberId: member.id, type: "call", subject: "Welcome call", notes: "Intro and onboarding.", createdAt: daysAgo(28) },
    { memberId: member.id, type: "email", subject: "Life plan link", notes: "Sent portal login and plan link.", createdAt: daysAgo(27) },
    { memberId: member.id, type: "email", subject: "Getting started guide", notes: "Links to resources and first steps.", createdAt: daysAgo(25) },
    { memberId: member.id, type: "call", subject: "Week 1 check-in", notes: "Answered questions on plan structure.", createdAt: daysAgo(21) },
    { memberId: member.id, type: "mailout", subject: "Newsletter – habits", notes: "Tips on building daily habits.", createdAt: daysAgo(18) },
    { memberId: member.id, type: "call", subject: "Week 2 check-in", notes: "Reviewed health & energy goals.", createdAt: daysAgo(14) },
    { memberId: member.id, type: "email", subject: "Step goal reminder", notes: "10k steps tracking link.", createdAt: daysAgo(12) },
    { memberId: member.id, type: "call", subject: "Family dinner planning", notes: "Blocked Sunday 5–7pm.", createdAt: daysAgo(10) },
    { memberId: member.id, type: "mailout", subject: "Newsletter Q1", notes: "Life plan tips and recap.", createdAt: daysAgo(7) },
    { memberId: member.id, type: "call", subject: "30-day check-in", notes: "Reviewed goals; walking habit on track.", createdAt: daysAgo(5) },
    { memberId: member.id, type: "email", subject: "Renewal reminder", notes: "Subscription renews next month.", createdAt: daysAgo(2) },
    { memberId: member.id, type: "call", subject: "Quick follow-up", notes: "Confirmed next session time.", createdAt: daysAgo(1) },
    { memberId: member2.id, type: "call", subject: "Discovery call", notes: "Discussed Business plan and next steps.", createdAt: daysAgo(30) },
    { memberId: member2.id, type: "email", subject: "Contract and invoice", notes: "Sent SOVEREIGN Business agreement.", createdAt: daysAgo(28) },
    { memberId: member2.id, type: "call", subject: "Kickoff", notes: "Set Demo Business Life Plan; QBR schedule.", createdAt: daysAgo(26) },
    { memberId: member2.id, type: "email", subject: "QBR template", notes: "Shared agenda template for client reviews.", createdAt: daysAgo(24) },
    { memberId: member2.id, type: "call", subject: "Weekly sync", notes: "Client delivery priorities.", createdAt: daysAgo(21) },
    { memberId: member2.id, type: "email", subject: "Team sync agenda", notes: "Monday 9am agenda sent.", createdAt: daysAgo(20) },
    { memberId: member2.id, type: "call", subject: "QBR prep", notes: "Prepared for top 3 client QBRs.", createdAt: daysAgo(17) },
    { memberId: member2.id, type: "mailout", subject: "Business newsletter", notes: "Operations and scaling tips.", createdAt: daysAgo(14) },
    { memberId: member2.id, type: "call", subject: "Team sync follow-up", notes: "Action items from Monday.", createdAt: daysAgo(13) },
    { memberId: member2.id, type: "email", subject: "Invoice INV-002", notes: "Sent monthly Business invoice.", createdAt: daysAgo(10) },
    { memberId: member2.id, type: "call", subject: "Mid-month review", notes: "Retention and ops check.", createdAt: daysAgo(7) },
    { memberId: member2.id, type: "email", subject: "Training materials", notes: "QBR facilitation deck.", createdAt: daysAgo(5) },
    { memberId: member2.id, type: "call", subject: "Renewal conversation", notes: "Confirmed renewal; add-ons discussed.", createdAt: daysAgo(3) },
    { memberId: member2.id, type: "email", subject: "Next week agenda", notes: "Upcoming QBRs and team sync.", createdAt: daysAgo(1) },
  ];
  for (const c of comms) await prisma.communication.create({ data: c });
  console.log("Created " + comms.length + " communications (1 month spread).");

  // Chores over the month (mix of done and open)
  await prisma.chore.create({ data: { title: "Review demo member", description: "Check portal and plan display", done: true, doneAt: daysAgo(25) } });
  await prisma.chore.create({ data: { title: "Send welcome emails", description: "New signups this week", done: true, doneAt: daysAgo(20) } });
  await prisma.chore.create({ data: { title: "Update docs", description: "After demo data is verified", done: true, doneAt: daysAgo(12) } });
  await prisma.chore.create({ data: { title: "Reconcile manual payments", description: "Match to open invoices", done: true, doneAt: daysAgo(5) } });
  await prisma.chore.create({ data: { title: "Send renewal reminders", description: "Members due in 30 days" } });
  await prisma.chore.create({ data: { title: "Month-end invoice run", description: "Generate open invoices" } });
  await prisma.chore.create({ data: { title: "Review past_due list", description: "Follow up on overdue invoices" } });
  console.log("Created 7 chores (4 done, 3 open).");

  // One month of expenditures per member
  const expenditures = [
    { memberId: member.id, description: "Course materials", amountCents: 2990, date: daysAgo(28), notes: "Life plan workbook." },
    { memberId: member.id, description: "Coaching session", amountCents: 5000, date: daysAgo(25), notes: "Monthly 1:1." },
    { memberId: member.id, description: "Fitness app subscription", amountCents: 999, date: daysAgo(22), notes: "Step tracking." },
    { memberId: member.id, description: "Books (habits)", amountCents: 2495, date: daysAgo(18), notes: "Two titles." },
    { memberId: member.id, description: "Coaching session", amountCents: 5000, date: daysAgo(18), notes: "Follow-up 1:1." },
    { memberId: member.id, description: "Weekly meal prep", amountCents: 4500, date: daysAgo(14), notes: "Health focus." },
    { memberId: member.id, description: "Coaching session", amountCents: 5000, date: daysAgo(11), notes: "Monthly 1:1." },
    { memberId: member.id, description: "Annual retreat ticket", amountCents: 15000, date: daysAgo(7), notes: "Early bird." },
    { memberId: member.id, description: "Donation (community)", amountCents: 2500, date: daysAgo(4), notes: "Local cause." },
    { memberId: member.id, description: "Coaching session", amountCents: 5000, date: daysAgo(2), notes: "Month-end review." },
    { memberId: member2.id, description: "Consulting retainer", amountCents: 25000, date: daysAgo(30), notes: "Business plan month 1." },
    { memberId: member2.id, description: "Software (planning tool)", amountCents: 9900, date: daysAgo(28), notes: "Annual license." },
    { memberId: member2.id, description: "Office supplies", amountCents: 3500, date: daysAgo(24), notes: "QBR materials." },
    { memberId: member2.id, description: "Team training", amountCents: 50000, date: daysAgo(21), notes: "QBR facilitation." },
    { memberId: member2.id, description: "Conference ticket", amountCents: 14900, date: daysAgo(18), notes: "Industry event." },
    { memberId: member2.id, description: "Marketing (newsletter)", amountCents: 7500, date: daysAgo(14), notes: "Mailout tool." },
    { memberId: member2.id, description: "Client dinner", amountCents: 12000, date: daysAgo(10), notes: "Relationship building." },
    { memberId: member2.id, description: "Contractor (ops)", amountCents: 18000, date: daysAgo(7), notes: "One-off project." },
    { memberId: member2.id, description: "Subscriptions (stack)", amountCents: 5900, date: daysAgo(5), notes: "Monthly tools." },
    { memberId: member2.id, description: "Travel (client visit)", amountCents: 8500, date: daysAgo(2), notes: "QBR on-site." },
  ];
  for (const e of expenditures) await prisma.expenditure.create({ data: e });
  console.log("Created " + expenditures.length + " expenditures (1 month spread).");

  // One month of invoices per member (paid, open, past_due, partial)
  const invPaid1 = await prisma.invoice.create({
    data: { memberId: member.id, invoiceNumber: "INV-P-000", amountCents: 2500, dueDate: daysAgo(35), status: "paid" },
  });
  await prisma.payment.create({
    data: { invoiceId: invPaid1.id, amountCents: 2500, currencyType: "fiat", currencyCode: "USD", paymentProvider: "manual", providerPaymentId: "demo-payment-p0" },
  });
  const invPastDue1 = await prisma.invoice.create({
    data: { memberId: member.id, invoiceNumber: "INV-P-001b", amountCents: 2500, dueDate: daysAgo(5), status: "past_due" },
  });
  const invOpen1 = await prisma.invoice.create({
    data: { memberId: member.id, invoiceNumber: "INV-P-001", amountCents: 2500, dueDate: daysAgo(-14), status: "open" },
  });
  await prisma.payment.create({
    data: { invoiceId: invOpen1.id, amountCents: 1000, currencyType: "fiat", currencyCode: "USD", paymentProvider: "manual", providerPaymentId: "demo-payment-p1" },
  });
  await prisma.invoice.create({
    data: { memberId: member.id, invoiceNumber: "INV-P-002", amountCents: 2500, dueDate: daysAgo(-30), status: "open" },
  });

  const invPaid2 = await prisma.invoice.create({
    data: { memberId: member2.id, invoiceNumber: "INV-B-000", amountCents: 25000, dueDate: daysAgo(35), status: "paid" },
  });
  await prisma.payment.create({
    data: { invoiceId: invPaid2.id, amountCents: 25000, currencyType: "fiat", currencyCode: "USD", paymentProvider: "manual", providerPaymentId: "demo-payment-b0" },
  });
  const invOpen2 = await prisma.invoice.create({
    data: { memberId: member2.id, invoiceNumber: "INV-B-001", amountCents: 25000, dueDate: daysAgo(15), status: "open" },
  });
  await prisma.payment.create({
    data: { invoiceId: invOpen2.id, amountCents: 10000, currencyType: "fiat", currencyCode: "USD", paymentProvider: "manual", providerPaymentId: "demo-payment-b1" },
  });
  await prisma.invoice.create({
    data: { memberId: member2.id, invoiceNumber: "INV-B-001b", amountCents: 25000, dueDate: daysAgo(-3), status: "past_due" },
  });
  await prisma.invoice.create({
    data: { memberId: member2.id, invoiceNumber: "INV-B-002", amountCents: 25000, dueDate: daysAgo(-25), status: "open" },
  });
  console.log("Created 10 invoices (2 paid, 4 open, 2 past_due, 2 open with partial payment).");

  // One month of orders per member
  const o1 = await prisma.order.create({ data: { memberId: member.id, orderNumber: "ORD-P-001", totalCents: 2500, status: "paid" } });
  await prisma.orderLine.create({ data: { orderId: o1.id, type: "subscription", item: "SOVEREIGN Personal", unitCents: 2500, quantity: 1, totalCents: 2500 } });
  const o2 = await prisma.order.create({ data: { memberId: member.id, orderNumber: "ORD-P-002", totalCents: 2990, status: "paid" } });
  await prisma.orderLine.create({ data: { orderId: o2.id, type: "one-time", item: "Workbook", unitCents: 2990, quantity: 1, totalCents: 2990 } });
  const o3 = await prisma.order.create({ data: { memberId: member.id, orderNumber: "ORD-P-003", totalCents: 15000, status: "pending" } });
  await prisma.orderLine.create({ data: { orderId: o3.id, type: "one-time", item: "Annual retreat", unitCents: 15000, quantity: 1, totalCents: 15000 } });
  const o4 = await prisma.order.create({ data: { memberId: member.id, orderNumber: "ORD-P-004", totalCents: 2500, status: "paid" } });
  await prisma.orderLine.create({ data: { orderId: o4.id, type: "subscription", item: "SOVEREIGN Personal", unitCents: 2500, quantity: 1, totalCents: 2500 } });

  const o5 = await prisma.order.create({ data: { memberId: member2.id, orderNumber: "ORD-B-001", totalCents: 25000, status: "paid" } });
  await prisma.orderLine.create({ data: { orderId: o5.id, type: "subscription", item: "SOVEREIGN Business", unitCents: 25000, quantity: 1, totalCents: 25000 } });
  const o6 = await prisma.order.create({ data: { memberId: member2.id, orderNumber: "ORD-B-002", totalCents: 9900, status: "paid" } });
  await prisma.orderLine.create({ data: { orderId: o6.id, type: "one-time", item: "Planning software", unitCents: 9900, quantity: 1, totalCents: 9900 } });
  const o7 = await prisma.order.create({ data: { memberId: member2.id, orderNumber: "ORD-B-003", totalCents: 50000, status: "pending" } });
  await prisma.orderLine.create({ data: { orderId: o7.id, type: "one-time", item: "Team training", unitCents: 50000, quantity: 1, totalCents: 50000 } });
  const o8 = await prisma.order.create({ data: { memberId: member2.id, orderNumber: "ORD-B-004", totalCents: 25000, status: "paid" } });
  await prisma.orderLine.create({ data: { orderId: o8.id, type: "subscription", item: "SOVEREIGN Business", unitCents: 25000, quantity: 1, totalCents: 25000 } });
  console.log("Created 8 orders with order lines (5 paid, 3 pending).");

  console.log("Demo seed done. Members with fact data:");
  console.log("  1. Demo Personal — " + DEMO_MEMBER_EMAIL + " / demo1234 (Personal, SOVEREIGN: Personal)");
  console.log("  2. Demo Business — demo-business@sovereign-life-plan.local / fact4567 (Agency + MMPE4, SOVEREIGN: Business)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
