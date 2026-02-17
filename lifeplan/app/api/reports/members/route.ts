import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const members = await prisma.member.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { categories: { select: { category: true } } },
  });
  const headers = ["id", "email", "firstName", "lastName", "company", "phone", "city", "state", "zip", "categories"];
  const rows = members.map((m) => [
    m.id,
    m.email,
    m.firstName ?? "",
    m.lastName ?? "",
    m.company ?? "",
    m.phone ?? "",
    m.city ?? "",
    m.state ?? "",
    m.zip ?? "",
    m.categories.map((c) => c.category).join("; "),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=members.csv",
    },
  });
}
