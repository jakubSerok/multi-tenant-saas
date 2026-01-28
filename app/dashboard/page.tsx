import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "./components/SignOutButton";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/options";

import Link from "next/link";
import { TicketPriority, TicketStatus, UserRole } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { InviteUsersClient } from "./components/InviteUsersClient";
import { TicketFilters } from "./components/TicketFilters";
import { Pagination } from "./components/Pagination";

const statusColors = {
  [TicketStatus.OPEN]: "bg-blue-100 text-blue-800",
  [TicketStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [TicketStatus.CLOSED]: "bg-green-100 text-green-800",
};

const priorityColors = {
  [TicketPriority.LOW]: "bg-gray-100 text-gray-800",
  [TicketPriority.MEDIUM]: "bg-blue-100 text-blue-800",
  [TicketPriority.HIGH]: "bg-orange-100 text-orange-800",
  [TicketPriority.URGENT]: "bg-red-100 text-red-800",
};

interface DashboardPageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/auth/login");
  }

  // Get user info with role and organization
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      role: true,
      organizationId: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const pageSize = parseInt(resolvedSearchParams.pageSize || "10");
  const status = resolvedSearchParams.status as TicketStatus | undefined;
  const priority = resolvedSearchParams.priority as TicketPriority | undefined;
  const sort = resolvedSearchParams.sort || "";

  const whereClause: any = {
    organizationId: user.organizationId,
    ...(user.role === "MANAGER"
      ? {}
      : {
          OR: [
            { userId: session.user.id },
            { assignees: { some: { userId: session.user.id } } },
          ],
        }),
  };

  if (status) {
    whereClause.status = status;
  }

  if (priority) {
    whereClause.priority = priority;
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort) {
    switch (sort) {
      case "createdAt_asc":
        orderBy = { createdAt: "asc" };
        break;
      case "updatedAt_desc":
        orderBy = { updatedAt: "desc" };
        break;
      case "updatedAt_asc":
        orderBy = { updatedAt: "asc" };
        break;
      case "priority_desc":
        orderBy = [{ priority: "desc" }, { createdAt: "desc" }];
        break;
      case "priority_asc":
        orderBy = [{ priority: "asc" }, { createdAt: "desc" }];
        break;
      default:
        orderBy = { createdAt: "desc" };
    }
  }

  const totalCount = await db.ticket.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalCount / pageSize);
  const skip = (page - 1) * pageSize;

  const tickets = await db.ticket.findMany({
    where: whereClause,
    orderBy,
    skip,
    take: pageSize,
    include: {
      assignees: {
        include: { user: { select: { name: true, email: true } } },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your support tickets</p>
          </div>
          <div className="flex gap-3">
            <InviteUsersClient
              organizationId={user.organizationId}
              userRole={user.role}
            />
            <Link
              href="/dashboard/tickets/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Ticket
            </Link>
          </div>
          <SignOutButton />
        </div>

        <TicketFilters />

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tickets ({totalCount})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {status && `Status: ${status.replace("_", " ")} | `}
              {priority && `Priority: ${priority.toLowerCase()} | `}
              {sort && `Sorted: ${sort.replace("_", " ")} | `}
              Page {page} of {totalPages}
            </p>
          </div>

          {tickets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tickets found. Create your first ticket to get started.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="block hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {ticket.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticket.status]}`}
                            >
                              {ticket.status.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[ticket.priority]}`}
                          >
                            {ticket.priority.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {ticket.assignees && ticket.assignees.length > 0
                              ? ticket.assignees
                                  .map((assignee) => assignee.user.name)
                                  .join(", ")
                              : "Unassigned"}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Created{" "}
                            {formatDistanceToNow(new Date(ticket.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Created by {ticket.user.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalCount}
        />
      </div>
    </div>
  );
}
