"use client";

import { useState, useEffect } from "react";
import { TicketStatus } from "@prisma/client";

interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: string;
}

const statuses: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
  TicketStatus.CLOSED,
];

export function KanbanBoard() {
  const [tickets, setTickets] = useState<Record<TicketStatus, Ticket[]>>({
    [TicketStatus.OPEN]: [],
    [TicketStatus.IN_PROGRESS]: [],
    [TicketStatus.CLOSED]: [],
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/tickets");
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        const ticketData = await response.json();

        const organizedTickets = ticketData.reduce(
          (acc: Record<string, any[]>, ticket: any) => {
            if (!acc[ticket.status]) {
              acc[ticket.status] = [];
            }
            acc[ticket.status].push(ticket);
            return acc;
          },
          {} as Record<string, any[]>,
        );

        setTickets((prev) => ({
          ...prev,
          ...organizedTickets,
        }));
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, []);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return "bg-blue-50 border-l-4 border-l-blue-500";
      case TicketStatus.IN_PROGRESS:
        return "bg-amber-50 border-l-4 border-l-amber-500";
      case TicketStatus.CLOSED:
        return "bg-green-50 border-l-4 border-l-green-500";
      default:
        return "bg-gray-50 border-l-4 border-l-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "LOW":
        return "bg-gray-100 text-gray-800";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "URGENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 min-h-screen">
      {statuses.map((status) => (
        <div key={status} className="flex flex-col h-full">
          <div className={`${getStatusColor(status)} p-4 rounded-t-lg`}>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor:
                    status === TicketStatus.OPEN
                      ? "#3b82f6"
                      : status === TicketStatus.IN_PROGRESS
                        ? "#f59e0b"
                        : "#10b981",
                }}
              />
              {status.replace("_", " ")}
              <span className="ml-2 text-sm font-normal bg-white/50 px-2 py-0.5 rounded-full">
                {tickets[status]?.length || 0}
              </span>
            </h3>
          </div>
          <div className="flex-1 bg-white p-4 rounded-b-lg shadow-sm border border-t-0 border-gray-200 overflow-y-auto">
            <div className="space-y-3">
              {tickets[status]?.map((ticket) => (
                <div
                  key={ticket.id}
                  className="group p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <h4 className="font-medium text-gray-900 mb-1">
                    {ticket.title}
                  </h4>
                  <div className="flex justify-between items-center mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      #{ticket.id.slice(0, 6)}
                    </span>
                  </div>
                </div>
              ))}
              {(!tickets[status] || tickets[status].length === 0) && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">
                    No tickets in this column
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Drag tickets here or create a new one
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
