import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { toPriority, toTaskStatus } from "./utils";

type CreateTaskBody = {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  dueAt?: string | null;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateTaskBody;
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      status: toTaskStatus(body.status),
      priority: toPriority(body.priority),
      category: body.category ?? null,
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      userId: session.user.id
    }
  });

  return NextResponse.json(task, { status: 201 });
}
