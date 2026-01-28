"use client";
// app/dashboard/components/KanbanViewButton.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export function KanbanViewButton() {
  const sesion = useSession();
  if (sesion?.data?.user?.role !== UserRole.MANAGER) {
    return null;
  }
  return (
    <Link
      href="/dashboard/kanban"
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
    >
      <svg
        className="-ml-1 mr-2 h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 4a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm7-1a1 1 0 011 1v12a1 1 0 01-1 1h-1a1 1 0 01-1-1V4a1 1 0 011-1h1z"
          clipRule="evenodd"
        />
      </svg>
      Kanban View
    </Link>
  );
}
