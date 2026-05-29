import { NextRequest } from "next/server";
import { createPhysicalMovementTask } from "@/lib/physical-movement-tasks";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return createPhysicalMovementTask(req);
}
