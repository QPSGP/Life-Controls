import { redirect } from "next/navigation";

/** Legacy URL — renamed to physical movements */
export default function ChoresRedirectPage() {
  redirect("/admin/physical-movements");
}
