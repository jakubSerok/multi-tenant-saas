import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "../../../../auth/options";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: ticketId, commentId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        ticketId,
        userId: session.user.id,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found or access denied" }, { status: 404 });
    }

    const updatedComment = await db.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content: content.trim(),
        editedAt: new Date(),
        editedBy: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: ticketId, commentId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        ticketId,
        userId: session.user.id,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found or access denied" }, { status: 404 });
    }

    await db.comment.delete({
      where: {
        id: commentId,
      },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
