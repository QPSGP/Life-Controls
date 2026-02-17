import { redirect } from "next/navigation";
import { verifyAdminCookie } from "@/lib/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let verified = false;
  try {
    verified = await verifyAdminCookie();
  } catch (e) {
    console.error("Admin layout verifyAdminCookie error:", e);
    redirect("/admin/login?error=config");
  }
  if (!verified) redirect("/admin/login");
  return <>{children}</>;
}
