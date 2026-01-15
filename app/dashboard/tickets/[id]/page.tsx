import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TicketPageClient } from "./TicketPageClient";
import { authOptions } from "../../../api/auth/options";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/auth/login");
  }

  const ticket = await db.ticket.findFirst({
    where: {
      id: id,
      organizationId: session.user.organizationId,
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
      assignees: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h1>
            <p className="text-gray-600 mb-4">The ticket you're looking for doesn't exist or you don't have access to it.</p>
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <TicketPageClient ticket={ticket} currentUserId={session.user.id} />;
}
