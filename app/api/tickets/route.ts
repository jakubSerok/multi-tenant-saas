import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "../auth/options";

export async function POST(req:Request){
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        console.error('No session or user ID found in session');
        return NextResponse.json(
            { error: "Unauthorized - Please log in to create a ticket" },
            { status: 401 }
        );
    }

    const { title, description, priority, assigneeIds } = await req.json()
    
    if (!title || !description || !priority || !assigneeIds || !Array.isArray(assigneeIds)) {
        return NextResponse.json(
            { error: "Missing required fields or invalid assigneeIds format" },
            { status: 400 }
        )
    }
   
    try {
        console.log('Session user ID:', session.user.id);
        
        const user = await db.user.findUnique({
            where: { 
                id: session.user.id 
            },
            select: { 
                id: true, 
                organizationId: true 
            }
        });

        console.log('Found user:', user);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const ticket = await db.ticket.create({
            data: {
                title,
                description,
                priority,
                userId: user.id,
                organizationId: user.organizationId,
                assignees: {
                    create: assigneeIds.map((assigneeId: string) => ({
                        userId: assigneeId
                    }))
                }
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                assignees: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        })
        return NextResponse.json(ticket)
    } catch (error) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({error:"Failed to create ticket"}, {status:500})
    }
}