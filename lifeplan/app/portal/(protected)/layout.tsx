import { redirect } from "next/navigation";
import { getMemberIdFromCookie } from "@/lib/member-auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");
  return <>{children}</>;
}
