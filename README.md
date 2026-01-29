# Multi-Tenant SaaS Application

A modern, full-stack multi-tenant SaaS application built with Next.js, TypeScript, Prisma, and PostgreSQL. This application provides a robust ticketing system with user management, role-based access control, and organization-level data isolation.

## 🚀 Features

- **Multi-tenancy** - Isolated data between organizations
- **Authentication & Authorization** - Secure user authentication with NextAuth.js
- **Role-Based Access Control** - Different user roles (Admin, Manager, User)
- **Ticket Management** - Create, assign, and track tickets with different statuses and priorities
- **Kanban Board** - Visual task management with drag-and-drop interface
- **Real-time Updates** - Built with modern React and Next.js app router
- **Type Safety** - Full TypeScript support
- **Responsive Design** - Works on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Headless UI, Hero Icons, Lucide Icons
- **State Management**: React Context API
- **Drag & Drop**: @dnd-kit

## 📦 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/multi-tenant-saas.git
   cd multi-tenant-saas
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the following variables:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/multitenant_saas?schema=public"
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the database**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

# or

pnpm dev

# or

bun dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
```
