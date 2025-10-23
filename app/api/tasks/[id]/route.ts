import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { toPriority, toTaskStatus } from "../utils";

type UpdateTaskBody = {
  title?: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  category?: string | null;
  dueAt?: string | null;
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    }
  });

  if (!task) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UpdateTaskBody;

  const data: Prisma.TaskUpdateManyMutationInput = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.status !== undefined) data.status = toTaskStatus(body.status) ?? undefined;
  if (body.priority !== undefined) data.priority = toPriority(body.priority) ?? undefined;
  if (body.category !== undefined) data.category = body.category;
  if (body.dueAt !== undefined) {
    data.dueAt = body.dueAt ? new Date(body.dueAt) : null;
  }

  const task = await prisma.task.updateMany({
    where: {
      id: params.id,
      userId: session.user.id
    },
    data
  });

  if (task.count === 0) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const updated = await prisma.task.findUnique({ where: { id: params.id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = await prisma.task.deleteMany({
    where: {
      id: params.id,
      userId: session.user.id
    }
  });

  if (task.count === 0) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
