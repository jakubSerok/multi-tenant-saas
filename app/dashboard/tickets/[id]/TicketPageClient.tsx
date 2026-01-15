"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { EditTicketModal } from "./components/EditTicketModal";
import { AssignUsersModal } from "./components/AssignUsersModal";

interface User {
  name: string;
  email: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  user: User;
  assignees: Array<{ user: User; userId: string; ticketId: string }>;
}

interface TicketPageClientProps {
  ticket: Ticket;
  currentUserId: string;
}

const statusColors = {
  [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',
  [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.CLOSED]: 'bg-green-100 text-green-800',
};

const priorityColors = {
  [TicketPriority.LOW]: 'bg-gray-100 text-gray-800',
  [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [TicketPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [TicketPriority.URGENT]: 'bg-red-100 text-red-800',
};

export function TicketPageClient({ ticket, currentUserId }: TicketPageClientProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [ticketData, setTicketData] = useState(ticket);
  const router = useRouter();

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTicketData(updatedTicket);
    setShowEditModal(false);
    router.refresh();
  };

  const handleAssignUsers = (updatedTicket: Ticket) => {
    setTicketData(updatedTicket);
    setShowAssignModal(false);
    router.refresh();
  };

  const handleMarkAsComplete = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketData.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: TicketStatus.CLOSED }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      const updatedTicket = await response.json();
      setTicketData(updatedTicket);
      router.refresh();
    } catch (error) {
      console.error("Error marking ticket as complete:", error);
      alert("Failed to update ticket status");
    }
  };

  const handleDeleteTicket = async () => {
    if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/tickets/${ticketData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete ticket");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      alert("Failed to delete ticket");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{ticketData.title}</h1>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticketData.status]}`}>
                        {ticketData.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[ticketData.priority]}`}>
                        {ticketData.priority.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticketData.description}</p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Created {formatDistanceToNow(new Date(ticketData.createdAt), { addSuffix: true })}
                  </div>
                  {ticketData.updatedAt && (
                    <div className="flex items-center">
                      <svg className="mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Updated {formatDistanceToNow(new Date(ticketData.updatedAt), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Activity & Comments</h2>
              </div>
              <div className="px-6 py-4">
                <div className="text-center text-gray-500 py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <p className="mt-2">No comments yet. Be the first to comment!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Ticket Details</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Status</h3>
                  <p className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticketData.status]}`}>
                      {ticketData.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Priority</h3>
                  <p className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[ticketData.priority]}`}>
                      {ticketData.priority.toLowerCase()}
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Created By</h3>
                  <div className="mt-1 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {ticketData.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{ticketData.user.name}</p>
                      <p className="text-xs text-gray-500">{ticketData.user.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Assigned To</h3>
                  <div className="mt-1">
                    {ticketData.assignees && ticketData.assignees.length > 0 ? (
                      <div className="space-y-2">
                        {ticketData.assignees.map((assignee) => (
                          <div key={assignee.user.id} className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {assignee.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{assignee.user.name}</p>
                              <p className="text-xs text-gray-500">{assignee.user.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Unassigned</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Ticket ID</h3>
                  <p className="mt-1 text-sm text-gray-500 font-mono">{ticketData.id}</p>
                </div>
              </div>

              {currentUserId === ticketData.userId && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Ticket
                    </button>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Assign User
                    </button>
                    <button
                      onClick={handleMarkAsComplete}
                      disabled={ticketData.status === TicketStatus.CLOSED}
                      className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {ticketData.status === TicketStatus.CLOSED ? 'Completed' : 'Mark as Complete'}
                    </button>
                    <button
                      onClick={handleDeleteTicket}
                      className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showEditModal && (
          <EditTicketModal
            ticket={ticketData}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateTicket}
          />
        )}

        {showAssignModal && (
          <AssignUsersModal
            ticketId={ticketData.id}
            currentAssignees={ticketData.assignees}
            onClose={() => setShowAssignModal(false)}
            onAssign={handleAssignUsers}
          />
        )}
      </div>
    </div>
  );
}
