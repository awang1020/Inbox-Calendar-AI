import { NextResponse } from "next/server";
import { addSubtask, getSubtasks } from "@/lib/subtaskStore";

interface RouteParams {
  params: {
    taskId: string;
  };
}

export async function GET(_: Request, { params }: RouteParams) {
  const { taskId } = params;
  return NextResponse.json({ subtasks: getSubtasks(taskId) });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { taskId } = params;
  const body = await request.json();

  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const title = body.title.trim();

  if (!title) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  const subtask = addSubtask(taskId, {
    title,
    done: Boolean(body?.done)
  });

  return NextResponse.json(subtask, { status: 201 });
}
