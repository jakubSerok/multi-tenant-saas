// app/dashboard/kanban/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { KanbanBoard } from "./components/KanbanBoard";

export default function KanbanPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/login");
    },
  });

  // Only allow managers to access this page
  if (session?.user.role !== "MANAGER") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600">
            Drag and drop tickets to update their status
          </p>
        </div>
        <KanbanBoard />
      </div>
    </div>
  );
}
