import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { contactDisplayName, resolveSearchParams } from "@/lib/crm";
import { ContactForm } from "@/app/portal/(protected)/contacts/ContactForm";

export const dynamic = "force-dynamic";

export default async function AdminContactEditPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const { id } = await props.params;
  const params = await resolveSearchParams(props.searchParams);

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { member: { select: { id: true, email: true } } },
  });
  if (!contact) notFound();

  const companies = await prisma.company.findMany({
    where: { memberId: contact.memberId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={`/admin/contacts/${id}`} className="text-neutral-400 hover:text-white text-sm">← Contact</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit contact</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {contactDisplayName(contact)} · owner {contact.member.email}
          </p>
        </header>

        {params.error === "update" && <p className="text-amber-500 text-sm mb-4">Could not save changes.</p>}
        {params.error === "company" && <p className="text-amber-500 text-sm mb-4">Invalid company link.</p>}

        <ContactForm action={`/api/admin/contacts/${id}`} companies={companies} contact={contact} />
      </div>
    </main>
  );
}
