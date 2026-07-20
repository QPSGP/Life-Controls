import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { companyDisplayName, resolveSearchParams } from "@/lib/crm";
import { CompanyForm } from "@/app/portal/(protected)/companies/CompanyForm";

export const dynamic = "force-dynamic";

export default async function AdminCompanyEditPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const { id } = await props.params;
  const params = await resolveSearchParams(props.searchParams);

  const company = await prisma.company.findUnique({
    where: { id },
    include: { member: { select: { email: true } } },
  });
  if (!company) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={`/admin/companies/${id}`} className="text-neutral-400 hover:text-white text-sm">← Company</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit company</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {companyDisplayName(company)} · owner {company.member.email}
          </p>
        </header>

        {params.error === "update" && <p className="text-amber-500 text-sm mb-4">Could not save changes.</p>}
        {params.error === "missing" && <p className="text-amber-500 text-sm mb-4">Company name is required.</p>}

        <CompanyForm action={`/api/admin/companies/${id}`} company={company} />
      </div>
    </main>
  );
}
