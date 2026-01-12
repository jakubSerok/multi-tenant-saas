import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, companyName } = body;

    if (!name || !email || !password || !companyName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const existingUser = await db.user.findUnique({
  where: { email },
});

if (existingUser) {
  return new NextResponse("Email already in use", { status: 409 });
}
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.$transaction(async (tx:any) => {
      const organization = await tx.organization.create({
        data: {
          name: companyName,
        },
      });

  
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: UserRole.MANAGER,
          organizationId: organization.id,
        },
      });

      return { organization, user };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
