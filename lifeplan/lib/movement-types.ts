/** Canonical movement types for Mini-Day Schedule grouping (Life Control workflow). */
export const MOVEMENT_TYPES = [
  "Go To",
  "Read",
  "Think",
  "Write",
  "Call",
  "Operation",
  "Arithmetic",
  "Design/Art",
  "Health",
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

/** Order for displaying grouped sections (miniday schedule, reports). */
export const MOVEMENT_TYPE_ORDER = [...MOVEMENT_TYPES];

export function sortByMovementType<T>(items: T[], getType: (item: T) => string | null): T[] {
  const order = MOVEMENT_TYPE_ORDER as unknown as string[];
  return [...items].sort((a, b) => {
    const ia = order.indexOf(getType(a) ?? "");
    const ib = order.indexOf(getType(b) ?? "");
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
