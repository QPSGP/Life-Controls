import Link from "next/link";

export function CrmFilterTabs({
  basePath,
  category,
  visibility,
}: {
  basePath: string;
  category?: string;
  visibility?: string;
}) {
  const cat = category || "all";
  const vis = visibility || "all";

  function href(nextCat: string, nextVis: string) {
    const params = new URLSearchParams();
    if (nextCat !== "all") params.set("category", nextCat);
    if (nextVis !== "all") params.set("visibility", nextVis);
    const q = params.toString();
    return q ? `${basePath}?${q}` : basePath;
  }

  const tabClass = (active: boolean) =>
    `px-3 py-1 rounded text-sm ${active ? "bg-emerald-800 text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"}`;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-xs text-neutral-500 self-center mr-1">Category:</span>
      <Link href={href("all", vis)} className={tabClass(cat === "all")}>All</Link>
      <Link href={href("business", vis)} className={tabClass(cat === "business")}>Business</Link>
      <Link href={href("personal", vis)} className={tabClass(cat === "personal")}>Personal</Link>
      <span className="text-xs text-neutral-500 self-center mx-2">|</span>
      <span className="text-xs text-neutral-500 self-center mr-1">Visibility:</span>
      <Link href={href(cat, "all")} className={tabClass(vis === "all")}>All</Link>
      <Link href={href(cat, "private")} className={tabClass(vis === "private")}>Private</Link>
      <Link href={href(cat, "public")} className={tabClass(vis === "public")}>Public</Link>
    </div>
  );
}
