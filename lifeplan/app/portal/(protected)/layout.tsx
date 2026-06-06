import { redirect } from "next/navigation";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { PortalNav } from "./PortalNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  let docCount = 0;
  let planCount = 0;
  try {
    [docCount, planCount] = await Promise.all([
      prisma.universaDocument.count({ where: { memberId } }),
      prisma.subjectBusiness.count({ where: { memberId } }),
    ]);
  } catch (e) {
    console.error("Portal layout DB error:", e);
  }

  return (
    <>
      <PortalNav docCount={docCount} planCount={planCount} />
      {children}
    </>
  );
}
