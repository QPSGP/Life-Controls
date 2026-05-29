import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { resolveSearchParams } from "@/lib/crm";
import { ContactForm } from "../ContactForm";

export const dynamic = "force-dynamic";

export default async function PortalContactNewPage(props: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const params = await resolveSearchParams(props.searchParams);

  const companies = await prisma.company.findMany({
    where: { memberId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/portal/contacts" className="text-neutral-400 hover:text-white text-sm">← My contacts</Link>
          <h1 className="text-2xl font-semibold mt-2">Add contact</h1>
        </header>

        {params.error === "missing" && <p className="text-amber-500 text-sm mb-4">Enter at least a name or email.</p>}
        {params.error === "create" && <p className="text-amber-500 text-sm mb-4">Could not create contact.</p>}
        {params.error === "company" && <p className="text-amber-500 text-sm mb-4">Invalid company link.</p>}

        <ContactForm action="/api/portal/contacts" companies={companies} submitLabel="Create contact" />
      </div>
    </main>
  );
}
