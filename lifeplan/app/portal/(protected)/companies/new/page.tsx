import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { resolveSearchParams } from "@/lib/crm";
import { CompanyForm } from "../CompanyForm";

export const dynamic = "force-dynamic";

export default async function PortalCompanyNewPage(props: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const params = await resolveSearchParams(props.searchParams);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/portal/companies" className="text-neutral-400 hover:text-white text-sm">← My companies</Link>
          <h1 className="text-2xl font-semibold mt-2">Add company</h1>
        </header>

        {params.error === "missing" && <p className="text-amber-500 text-sm mb-4">Company name is required.</p>}
        {params.error === "create" && <p className="text-amber-500 text-sm mb-4">Could not create company.</p>}

        <CompanyForm action="/api/portal/companies" submitLabel="Create company" />
      </div>
    </main>
  );
}
