/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `Ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_assignedToId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "assignedToId";

-- CreateTable
CREATE TABLE "TicketAssignee" (
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TicketAssignee_pkey" PRIMARY KEY ("ticketId","userId")
);

-- AddForeignKey
ALTER TABLE "TicketAssignee" ADD CONSTRAINT "TicketAssignee_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAssignee" ADD CONSTRAINT "TicketAssignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
