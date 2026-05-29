import { NextRequest } from "next/server";
import { updatePhysicalMovementTask } from "@/lib/physical-movement-tasks";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updatePhysicalMovementTask(req, id);
}
