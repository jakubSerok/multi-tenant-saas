import { PrismaClient, UserRole, TicketStatus, TicketPriority } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create Organization
  const company = await prisma.organization.create({
    data: {
      name: "Acme Corporation",
      bio: "Demo company for testing support tickets",
    },
  });

  console.log("🏢 Organization created:", company.name);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Alice Admin",
      email: "admin@acme.com",
      role: UserRole.ADMIN,
      organizationId: company.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Mark Manager",
      email: "manager@acme.com",
      role: UserRole.MANAGER,
      organizationId: company.id,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Ulysses User",
      email: "user@acme.com",
      role: UserRole.USER,
      organizationId: company.id,
    },
  });

  console.log("👤 Users created:", admin.email, manager.email, user.email);

  // Create Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Cannot login to dashboard",
      description: "When I try to login, I get a 500 error.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      userId: user.id,
      assignedToId: manager.id,
      organizationId: company.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: "Billing page not loading",
      description: "The billing section stays blank after login.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      userId: user.id,
      assignedToId: admin.id,
      organizationId: company.id,
    },
  });

  console.log("🎫 Tickets created:", ticket1.title, ticket2.title);

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
