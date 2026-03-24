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

  const [docCount, planCount] = await Promise.all([
    prisma.universaDocument.count({ where: { memberId } }),
    prisma.subjectBusiness.count({ where: { memberId } }),
  ]);

  return (
    <>
      <PortalNav docCount={docCount} planCount={planCount} />
      {children}
    </>
  );
}
