import { NextResponse } from "next/server";
import { reorderSubtasks } from "@/lib/subtaskStore";

interface RouteParams {
  params: {
    taskId: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { taskId } = params;
  const body = await request.json();

  if (!Array.isArray(body?.order)) {
    return NextResponse.json({ error: "order must be an array" }, { status: 400 });
  }

  const orderedIds = body.order.filter((id: unknown): id is string => typeof id === "string");
  const subtasks = reorderSubtasks(taskId, orderedIds);

  return NextResponse.json({ subtasks });
}
