"use client"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Building2, User, Lock, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInvite = searchParams.get('invite') === 'true';
  const token = searchParams.get('token');

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    invitationToken: token || ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState<any>(null);
  const [validatingToken, setValidatingToken] = useState(false);

  useEffect(() => {
    if (token) {
      validateInvitationToken(token);
    }
  }, [token]);

  const validateInvitationToken = async (token: string) => {
    setValidatingToken(true);
    try {
      const response = await fetch(`/api/invitations/validate?token=${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setInvitation(data);
        setForm(prev => ({
          ...prev,
          email: data.email,
          companyName: data.organization.name
        }));
      } else {
        setError("Invalid or expired invitation token");
      }
    } catch (err) {
      setError("Failed to validate invitation");
    } finally {
      setValidatingToken(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register user");
      }

      if (invitation) {
        // Mark invitation as accepted
        await fetch(`/api/invitations/${invitation.id}/accept`, {
          method: "POST"
        });
      }

      router.push("/auth/login?message=Registration successful");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              {isInvite ? (
                <Mail className="h-8 w-8 text-indigo-600" />
              ) : (
                <Building2 className="h-8 w-8 text-indigo-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isInvite ? "Join Organization" : "Create Organization"}
            </h1>
            <p className="text-slate-600 mt-2">
              {isInvite 
                ? "Accept your invitation and get started"
                : "Start managing tickets with your team"
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {validatingToken && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600">Validating invitation...</p>
            </div>
          )}

          {invitation && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                You've been invited to join <strong>{invitation.organization.name}</strong> as a {invitation.role.toLowerCase()}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                disabled={!!invitation}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="john@example.com"
              />
            </div>

            {!isInvite && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Organization Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Acme Corp"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Lock className="h-4 w-4 inline mr-1" />
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || validatingToken}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  <span>{isInvite ? "Accept Invitation" : "Create Organization"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <a href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in
              </a>
            </p>
            {!isInvite && (
              <p className="text-xs text-slate-500 mt-2">
                Have an invitation?{" "}
                <a href="/auth/register?invite=true" className="text-indigo-600 hover:text-indigo-700">
                  Register with invitation
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
