"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Users, Ticket, Shield, CheckCircle } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-slate-900">TicketHub</span>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <Link 
                  href="/dashboard"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth/login"
                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Create Organization</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-6">
            Streamline Your
            <span className="text-indigo-600"> Ticket Management</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Powerful multi-tenant ticket system designed for teams. Create organizations, 
            manage tickets, and collaborate seamlessly with role-based access control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-2 text-slate-600">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Multi-Tenant Architecture</h3>
            <p className="text-slate-600">
              Create and manage multiple organizations with complete data isolation and security.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Role-Based Access</h3>
            <p className="text-slate-600">
              Admin, Manager, and User roles ensure proper access control and permissions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Ticket className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Smart Ticket Management</h3>
            <p className="text-slate-600">
              Assign tickets to multiple users, track status, and prioritize work efficiently.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of teams already using TicketHub to manage their projects.
          </p>
          <Link 
            href="/auth/register"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-slate-50 transition-colors text-lg font-semibold inline-flex items-center space-x-2"
          >
            <span>Create Your Organization</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Invitation Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h3 className="text-2xl font-semibold text-slate-900 mb-4 text-center">
            How Invitations Work
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-slate-900 mb-2">Manager Sends Invite</h4>
              <p className="text-sm text-slate-600">
                Organization managers can invite team members by email with specific roles
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-slate-900 mb-2">User Receives Email</h4>
              <p className="text-sm text-slate-600">
                User gets a unique invitation link with 7-day expiration via email
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-slate-900 mb-2">Complete Registration</h4>
              <p className="text-sm text-slate-600">
                User clicks link, fills registration form, and joins the organization
              </p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-slate-600 mb-4">
              Have an invitation? Click below to register with your invitation code.
            </p>
            <Link 
              href="/auth/register?invite=true"
              className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center space-x-1"
            >
              <span>Register with Invitation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
