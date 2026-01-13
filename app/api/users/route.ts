import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch users from the same organization
    const users = await db.user.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
