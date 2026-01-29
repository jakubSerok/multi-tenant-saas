"use client";

import { useState, useEffect } from "react";
import { TicketStatus } from "@prisma/client";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: string;
  description?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  assignees?: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

const statuses: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
  TicketStatus.CLOSED,
];

function DroppableColumn({
  status,
  children,
  getStatusColor,
  ticketCount,
}: {
  status: TicketStatus;
  children: React.ReactNode;
  getStatusColor: (status: TicketStatus) => string;
  ticketCount: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div key={status} className="flex flex-col h-full">
      <div
        className={`${getStatusColor(status)} p-4 rounded-t-lg ${isOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}
      >
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
            {ticketCount}
          </span>
        </h3>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 bg-white p-4 rounded-b-lg shadow-sm border border-t-0 border-gray-200 overflow-y-auto ${
          isOver ? "bg-blue-50 border-blue-300" : ""
        }`}
        data-status={status}
      >
        {children}
      </div>
    </div>
  );
}

function DraggableTicket({ ticket }: { ticket: Ticket }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
    <div
      ref={setNodeRef}
      style={style}
      className="group p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-move"
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        window.location.href = `/dashboard/tickets/${ticket.id}`;
      }}
    >
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {ticket.title}
      </h4>
      {ticket.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {ticket.description}
        </p>
      )}
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}
        >
          {ticket.priority}
        </span>
        <span className="text-xs text-gray-500">#{ticket.id.slice(0, 6)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {ticket.user?.name || "Unassigned"}
        </div>
        {ticket.assignees && ticket.assignees.length > 0 && (
          <div className="flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {ticket.assignees.length}
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const [tickets, setTickets] = useState<Record<TicketStatus, Ticket[]>>({
    [TicketStatus.OPEN]: [],
    [TicketStatus.IN_PROGRESS]: [],
    [TicketStatus.CLOSED]: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/tickets");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch tickets");
        }
        const ticketData = await response.json();

        const organizedTickets: Record<TicketStatus, Ticket[]> = {
          [TicketStatus.OPEN]: [],
          [TicketStatus.IN_PROGRESS]: [],
          [TicketStatus.CLOSED]: [],
        };

        ticketData.forEach((ticket: any) => {
          const status = ticket.status as TicketStatus;
          if (status && organizedTickets[status]) {
            organizedTickets[status].push(ticket);
          }
        });

        setTickets(organizedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch tickets",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticketId = active.id as string;

    let foundTicket: Ticket | null = null;
    for (const status of statuses) {
      const ticket = tickets[status].find((t) => t.id === ticketId);
      if (ticket) {
        foundTicket = ticket;
        break;
      }
    }

    setActiveTicket(foundTicket);
  };

  const handleDragOver = (event: DragOverEvent) => {};

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTicket(null);
      return;
    }

    const ticketId = active.id as string;
    const newStatus = over.id as TicketStatus;

    // Check if the new status is valid
    if (!statuses.includes(newStatus)) {
      setActiveTicket(null);
      return;
    }

    let currentStatus: TicketStatus | null = null;
    let ticketToMove: Ticket | null = null;

    for (const status of statuses) {
      const ticket = tickets[status].find((t) => t.id === ticketId);
      if (ticket) {
        currentStatus = status;
        ticketToMove = ticket;
        break;
      }
    }

    if (!ticketToMove || !currentStatus || currentStatus === newStatus) {
      setActiveTicket(null);
      return;
    }

    // Update the ticket status in the database
    setUpdatingTicket(ticketId);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticket status");
      }

      setTickets((prev) => {
        const newTickets = { ...prev };

        newTickets[currentStatus] = newTickets[currentStatus].filter(
          (t) => t.id !== ticketId,
        );

        newTickets[newStatus] = [
          ...newTickets[newStatus],
          { ...ticketToMove, status: newStatus },
        ];

        return newTickets;
      });
    } catch (error) {
      console.error("Error updating ticket status:", error);
    } finally {
      setUpdatingTicket(null);
      setActiveTicket(null);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Error loading tickets</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 min-h-screen">
        {statuses.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            getStatusColor={getStatusColor}
            ticketCount={tickets[status]?.length || 0}
          >
            <SortableContext
              items={tickets[status]?.map((t) => t.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {tickets[status]?.map((ticket) => (
                  <DraggableTicket key={ticket.id} ticket={ticket} />
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
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="rotate-6 scale-105 shadow-2xl">
            <DraggableTicket ticket={activeTicket} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
