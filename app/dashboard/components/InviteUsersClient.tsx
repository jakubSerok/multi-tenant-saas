"use client";

import { useState } from "react";
import { InviteUsersModal } from "./InviteUsersModal";

interface InviteUsersClientProps {
  organizationId: string;
  userRole: string;
}

export function InviteUsersClient({ organizationId, userRole }: InviteUsersClientProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Only show invite button for managers and admins
  if (userRole === 'USER') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowInviteModal(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
        Invite Users
      </button>

      {showInviteModal && (
        <InviteUsersModal
          organizationId={organizationId}
          onClose={() => setShowInviteModal(false)}
          onInvite={(invitations) => {
            console.log("Invitations sent:", invitations);
            setShowInviteModal(false);
          }}
        />
      )}
    </>
  );
}
