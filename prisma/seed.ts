import { PrismaClient, UserRole, TicketStatus, TicketPriority } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password for test users
  const hashedPassword = await hash("password123", 12);

  // Create HyperBay Studio Organization
  const hyperbay = await prisma.organization.upsert({
    where: { id: "cmkbgtohg0000rcv9fenu7jwh" },
    update: {
      name: "HyperBay Studio Spółka",
      bio: "Software development and consulting services",
    },
    create: {
      id: "cmkbgtohg0000rcv9fenu7jwh",
      name: "HyperBay Studio Spółka",
      bio: "Software development and consulting services",
    },
  });

  console.log("🏢 Organization:", hyperbay.name);

  // Create Test Users
  const testUsers = [
    {
      name: "John Doe",
      email: "john.doe@hyperbay.com",
      role: UserRole.ADMIN,
      password: hashedPassword,
    },
    {
      name: "Jane Smith",
      email: "jane.smith@hyperbay.com",
      role: UserRole.MANAGER,
      password: hashedPassword,
    },
    {
      name: "Mike Johnson",
      email: "mike.johnson@hyperbay.com",
      role: UserRole.DEVELOPER,
      password: hashedPassword,
    },
    {
      name: "Sarah Wilson",
      email: "sarah.wilson@hyperbay.com",
      role: UserRole.DEVELOPER,
      password: hashedPassword,
    },
    {
      name: "Alex Brown",
      email: "alex.brown@hyperbay.com",
      role: UserRole.USER,
      password: hashedPassword,
    },
    {
      name: "Emma Davis",
      email: "emma.davis@hyperbay.com",
      role: UserRole.USER,
      password: hashedPassword,
    },
  ];

  // Create users and store their IDs
  const createdUsers = [];
  for (const user of testUsers) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: hyperbay.id,
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
        organizationId: hyperbay.id,
      },
    });
    createdUsers.push(createdUser);
    console.log(`👤 Created user: ${createdUser.name} (${createdUser.role})`);
  }

  // Create Sample Tickets
  const tickets = [
    {
      title: "Fix login page styling",
      description: "The login button is not aligned properly on mobile devices.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      userId: createdUsers[4].id, // Alex (USER)
      organizationId: hyperbay.id,
      assignees: [createdUsers[2].id, createdUsers[3].id], // Mike and Sarah (DEVELOPERs)
    },
    {
      title: "Database optimization",
      description: "Need to optimize slow database queries in the reporting module.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      userId: createdUsers[1].id, // Jane (MANAGER)
      organizationId: hyperbay.id,
      assignees: [createdUsers[2].id], // Mike (DEVELOPER)
    },
    {
      title: "Update documentation",
      description: "API documentation needs to be updated with the new endpoints.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      userId: createdUsers[5].id, // Emma (USER)
      organizationId: hyperbay.id,
      assignees: [createdUsers[3].id], // Sarah (DEVELOPER)
    },
  ];

  // Create tickets with assignees
  for (const ticket of tickets) {
    const { assignees, ...ticketData } = ticket;
    const createdTicket = await prisma.ticket.create({
      data: {
        ...ticketData,
        assignees: {
          create: assignees.map(userId => ({
            user: { connect: { id: userId } }
          }))
        },
      },
      include: {
        assignees: {
          include: { user: true }
        }
      }
    });

    console.log(`🎫 Created ticket: ${createdTicket.title}`);
    console.log(`   Status: ${createdTicket.status}, Priority: ${createdTicket.priority}`);
    console.log(`   Assignees: ${createdTicket.assignees.map(a => a.user.name).join(', ')}`);
  }

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