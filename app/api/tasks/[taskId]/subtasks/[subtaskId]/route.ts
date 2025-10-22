import { NextResponse } from "next/server";
import { deleteSubtask, getSubtasks, updateSubtask } from "@/lib/subtaskStore";

interface RouteParams {
  params: {
    taskId: string;
    subtaskId: string;
  };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { taskId, subtaskId } = params;
  const body = await request.json();

  try {
    const updated = updateSubtask(taskId, subtaskId, body ?? {});
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const { taskId, subtaskId } = params;

  try {
    deleteSubtask(taskId, subtaskId);
    return NextResponse.json({ subtasks: getSubtasks(taskId) });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
