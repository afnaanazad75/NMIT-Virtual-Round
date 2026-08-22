import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui";
import { apiErrorMessage } from "../api/client";
import { Briefcase, UserRound } from "lucide-react";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to create your account. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700 text-white font-display font-bold text-sm">
            D
          </div>
          <span className="font-display text-lg font-bold text-ink-900">Dayflow</span>
        </div>

        <div className="bg-white rounded-2xl border border-ink-100 shadow-soft px-7 py-8 sm:px-9 sm:py-9">
          <h1 className="font-display text-2xl font-bold text-ink-900 text-center">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-ink-500 text-center">
            Set up access to your HR workspace in a minute.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => update("role", "employee")}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-medium transition-colors ${
                  form.role === "employee"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-ink-200 text-ink-600 hover:bg-ink-50"
                }`}
              >
                <UserRound size={18} />
                Employee
              </button>
              <button
                type="button"
                onClick={() => update("role", "admin")}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-medium transition-colors ${
                  form.role === "admin"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-ink-200 text-ink-600 hover:bg-ink-50"
                }`}
              >
                <Briefcase size={18} />
                HR / Admin
              </button>
            </div>

            <Input
              label="Full name"
              placeholder="Jordan Smith"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
            <Input
              label="Employee ID"
              placeholder="DF-EMP-104"
              value={form.employeeId}
              onChange={(e) => update("employeeId", e.target.value)}
              required
            />
            <Input
              label="Work email"
              type="email"
              placeholder="you@dayflow.io"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters, with a letter and number"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              autoComplete="new-password"
            />

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-700 hover:text-indigo-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
