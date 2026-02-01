import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

export async function createTestOrganization(name: string) {
  return await prisma.organization.create({
    data: {
      name,
      bio: `Test organization: ${name}`,
    },
  });
}

export async function createTestUser(
  organizationId: string,
  email: string,
  password: string,
  role: 'ADMIN' | 'MANAGER' | 'USER' = 'USER'
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return await prisma.user.create({
    data: {
      name: email.split('@')[0],
      email,
      password: hashedPassword,
      role,
      organizationId,
    },
  });
}

export async function createTestTicket(
  organizationId: string,
  userId: string,
  title: string,
  description: string,
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM'
) {
  return await prisma.ticket.create({
    data: {
      title,
      description,
      priority,
      organizationId,
      userId,
    },
  });
}

export async function cleanupTestData() {
  await prisma.comment.deleteMany();
  await prisma.ticketAssignee.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

export async function setupTestData() {
  await cleanupTestData();
  
  const org = await createTestOrganization('Test Organization');
  
  const admin = await createTestUser(org.id, 'admin@test.com', 'admin123', 'ADMIN');
  const manager = await createTestUser(org.id, 'manager@test.com', 'manager123', 'MANAGER');
  const user = await createTestUser(org.id, 'user@test.com', 'user123', 'USER');
  
  const ticket1 = await createTestTicket(org.id, user.id, 'Login Issue', 'Cannot login to the system', 'HIGH');
  const ticket2 = await createTestTicket(org.id, user.id, 'Bug Report', 'Found a bug in the dashboard', 'MEDIUM');
  
  return { org, admin, manager, user, tickets: [ticket1, ticket2] };
}
