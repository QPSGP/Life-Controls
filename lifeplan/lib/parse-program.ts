export function parseProgramSentence(
  text: string,
  purposes: { id: string; name: string }[]
): { name: string; templateId: string | null } {
  const raw = text.trim();
  const like = raw.match(/^(.*?)(?:,|\s)\s*(?:same shape as|like|copy of)\s+(.+)$/i);
  let name = raw;
  let templateHint = "";
  if (like) {
    name = like[1].replace(/[,\s]+$/g, "").trim();
    templateHint = like[2].trim();
  }
  const hint = templateHint.toLowerCase();
  const template =
    purposes.find((p) => hint && p.name.toLowerCase() === hint) ||
    purposes.find((p) => hint && (p.name.toLowerCase().includes(hint) || hint.includes(p.name.toLowerCase())));
  return { name: name || raw, templateId: template?.id ?? null };
}
