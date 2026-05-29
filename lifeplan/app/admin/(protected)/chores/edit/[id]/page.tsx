import { redirect } from "next/navigation";

export default async function ChoresEditRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/physical-movements/edit/${id}`);
}
