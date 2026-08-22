import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui";
import { apiErrorMessage } from "../api/client";
import { CheckCircle2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      const dest = location.state?.from || "/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to sign in. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700 text-white font-display font-bold text-sm">
              D
            </div>
            <span className="font-display text-lg font-bold text-ink-900">Dayflow</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Sign in to view your dashboard, attendance, and leave.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Work email"
              type="email"
              placeholder="you@dayflow.io"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New to Dayflow?{" "}
            <Link to="/signup" className="font-semibold text-indigo-700 hover:text-indigo-800">
              Create an account
            </Link>
          </p>

          <div className="mt-8 rounded-xl border border-ink-100 bg-ink-50 px-4 py-3.5 text-xs text-ink-500">
            <p className="font-medium text-ink-700 mb-1">Demo credentials</p>
            <p>Employee — rohan@dayflow.io</p>
            <p>Admin — admin@dayflow.io</p>
            <p>Password — Password@123</p>
          </div>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="hidden lg:flex relative bg-indigo-950 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #4f56d6 0%, transparent 45%), radial-gradient(circle at 80% 70%, #33339c 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 max-w-md px-10 text-white">
          <p className="text-sm font-medium text-indigo-300 mb-3 tracking-wide uppercase">
            Every workday, perfectly aligned
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight">
            One home for attendance, leave, and payroll.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {[
              "Check in and track hours in one tap",
              "Apply for leave and follow approvals live",
              "See salary structure without the paperwork",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-indigo-100">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-indigo-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
