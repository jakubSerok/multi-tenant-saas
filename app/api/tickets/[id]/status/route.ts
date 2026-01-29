import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "../../../auth/options";
import { TicketStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized - Please log in" },
      { status: 401 },
    );
  }

  const { status } = await req.json();

  if (!status || !Object.values(TicketStatus).includes(status)) {
    return NextResponse.json(
      { error: "Invalid status provided" },
      { status: 400 },
    );
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        organizationId: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const whereClause: any = {
      id: id,
      organizationId: user.organizationId,
    };

    if (user.role !== "MANAGER") {
      whereClause.OR = [
        { userId: session.user.id },
        { assignees: { some: { userId: session.user.id } } },
      ];
    }

    const existingTicket = await db.ticket.findFirst({
      where: whereClause,
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: "Ticket not found or access denied" },
        { status: 404 },
      );
    }

    const updatedTicket = await db.ticket.update({
      where: { id: id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignees: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json(
      { error: "Failed to update ticket status" },
      { status: 500 },
    );
  }
}
