import { NextRequest } from "next/server";
import { togglePhysicalMovementTaskDone } from "@/lib/physical-movement-tasks";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return togglePhysicalMovementTaskDone(req, id);
}
