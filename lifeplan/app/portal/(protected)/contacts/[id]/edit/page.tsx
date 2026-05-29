import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { resolveSearchParams } from "@/lib/crm";
import { ContactForm } from "../../ContactForm";

export const dynamic = "force-dynamic";

export default async function PortalContactEditPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const { id } = await props.params;
  const params = await resolveSearchParams(props.searchParams);

  const [contact, companies] = await Promise.all([
    prisma.contact.findFirst({ where: { id, memberId } }),
    prisma.company.findMany({ where: { memberId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!contact) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={`/portal/contacts/${id}`} className="text-neutral-400 hover:text-white text-sm">← Contact</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit contact</h1>
        </header>

        {params.error === "update" && <p className="text-amber-500 text-sm mb-4">Could not save changes.</p>}
        {params.error === "company" && <p className="text-amber-500 text-sm mb-4">Invalid company link.</p>}

        <ContactForm action={`/api/portal/contacts/${id}`} companies={companies} contact={contact} />
      </div>
    </main>
  );
}
