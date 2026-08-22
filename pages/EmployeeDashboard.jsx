import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  CalendarCheck,
  FileClock,
  LogOut as LogOutIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card, Badge, statusTone, Button, EmptyState } from "../components/ui";
import { formatDate, todayISO } from "../utils/format";

const quickLinks = [
  { to: "/profile", label: "Profile", icon: UserRound, tone: "bg-indigo-50 text-indigo-700" },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, tone: "bg-emerald-50 text-emerald-700" },
  { to: "/leave", label: "Leave Requests", icon: FileClock, tone: "bg-amber-50 text-amber-700" },
];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [today, setToday] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [attRes, leaveRes] = await Promise.all([
        api.get("/attendance", { params: { date: todayISO() } }),
        api.get("/leave"),
      ]);
      setToday(attRes.data.attendance[0] || null);
      setLeaves(leaveRes.data.leaves.slice(0, 4));
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCheckIn() {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.post("/attendance/check-in");
      setToday(res.data.attendance);
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.post("/attendance/check-out");
      setToday(res.data.attendance);
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  const firstName = user?.name?.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1.5">
          {formatDate(todayISO())}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Here's what's on your plate today at {user?.department}.
        </p>
      </div>

      {/* Check-in card */}
      <Card className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <Clock size={22} />
          </div>
          <div>
            <p className="font-display font-semibold text-ink-900">Today's attendance</p>
            {today?.checkIn ? (
              <p className="text-sm text-ink-500">
                Checked in at <span className="font-medium text-ink-700">{today.checkIn}</span>
                {today.checkOut && (
                  <>
                    {" "}
                    · Checked out at{" "}
                    <span className="font-medium text-ink-700">{today.checkOut}</span>
                  </>
                )}
              </p>
            ) : (
              <p className="text-sm text-ink-500">You haven't checked in yet.</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {today?.status && <Badge tone={statusTone(today.status)}>{today.status}</Badge>}
          {!today?.checkIn && (
            <Button onClick={handleCheckIn} disabled={actionLoading}>
              Check in
            </Button>
          )}
          {today?.checkIn && !today?.checkOut && (
            <Button variant="secondary" onClick={handleCheckOut} disabled={actionLoading}>
              Check out
            </Button>
          )}
        </div>
      </Card>
      {actionError && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">
          {actionError}
        </p>
      )}

      {/* Quick access cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {quickLinks.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="h-full transition-shadow hover:shadow-lift cursor-pointer">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}>
                <item.icon size={20} />
              </div>
              <p className="mt-4 font-display font-semibold text-ink-900">{item.label}</p>
              <p className="mt-1 text-xs text-ink-500">Open {item.label.toLowerCase()}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <Card padded={false}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-display font-semibold text-ink-900">Recent leave activity</h2>
          <Link to="/leave" className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="px-6 pb-6 text-sm text-ink-400">Loading…</div>
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={FileClock}
            title="No leave requests yet"
            description="When you apply for leave, updates will show up here."
          />
        ) : (
          <ul className="divide-y divide-ink-100">
            {leaves.map((leave) => (
              <li key={leave.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                    {leave.status === "Approved" ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : leave.status === "Rejected" ? (
                      <AlertCircle size={16} className="text-rose-600" />
                    ) : (
                      <Clock size={16} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">
                      {leave.type} leave · {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </p>
                    <p className="text-xs text-ink-500">{leave.remarks || "No remarks added"}</p>
                  </div>
                </div>
                <Badge tone={statusTone(leave.status)}>{leave.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
