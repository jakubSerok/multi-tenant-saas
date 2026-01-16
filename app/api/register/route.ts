import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, companyName, invitationToken } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let organization;
    let userRole: UserRole = UserRole.USER;

    // Handle invitation-based registration
    if (invitationToken) {
      const invitation = await db.invitation.findUnique({
        where: { token: invitationToken },
        include: {
          organization: true
        }
      });

      if (!invitation) {
        return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 });
      }

      if (invitation.accepted) {
        return NextResponse.json({ error: "Invitation already accepted" }, { status: 400 });
      }

      if (new Date() > invitation.expiresAt) {
        return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
      }

      if (invitation.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ error: "Email doesn't match invitation" }, { status: 400 });
      }

      organization = invitation.organization;
      userRole = invitation.role;

      // Mark invitation as accepted
      await db.invitation.update({
        where: { id: invitation.id },
        data: { accepted: true }
      });
    } else {
      // Regular registration - require company name
      if (!companyName) {
        return NextResponse.json({ error: "Company name is required" }, { status: 400 });
      }

      // Create new organization
      organization = await db.organization.create({
        data: {
          name: companyName,
        },
      });

      userRole = UserRole.MANAGER; // First user becomes manager
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        organizationId: organization.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      user,
      organization,
      message: invitationToken ? "Successfully joined organization" : "Organization created successfully"
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
