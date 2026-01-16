import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "../../auth/options"; 

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, priority } = await req.json();

    if (!title || !description || !priority) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    try {
        const ticket = await db.ticket.findUnique({
            where: { id: id },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        if (ticket.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedTicket = await db.ticket.update({
            where: {
                id: id,
            },
            data: {
                title,
                description,
                priority,
            },
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error("Error updating ticket:", error);
        return NextResponse.json(
            { error: "Failed to update ticket" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request, 
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // First delete all assignees for this ticket
        await db.ticketAssignee.deleteMany({
            where: { ticketId: id },
        });

        // Then delete the ticket
        const result = await db.ticket.deleteMany({
            where: {
                id: id,
                userId: session.user.id, 
            },
        });

        if (result.count === 0) {
            return NextResponse.json(
                { error: "Ticket not found or you do not have permission" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Ticket deleted successfully" });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        return NextResponse.json(
            { error: "Failed to delete ticket" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assigneeIds } = await req.json();

    if (!Array.isArray(assigneeIds)) {
        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    try {
        const ticket = await db.ticket.findUnique({
            where: { id: id },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }
        
        if (ticket.userId !== session.user.id) {
             return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedTicket = await db.ticket.update({
            where: { id: id },
            data: {
                assignees: {
                    create: assigneeIds.map((userId: string) => ({
                        userId: userId,
                    })),
                },
            },
            include: {
                assignees: true,    
            }
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error("Error assigning user to ticket:", error);
        return NextResponse.json(
            { error: "Failed to assign user to ticket" },
            { status: 500 }
        );
    }
}