import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarCheck, FileClock, Wallet } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { Card, Badge, statusTone, EmptyState, PageHeader } from "../../components/ui";
import { formatCurrency, formatDate } from "../../utils/format";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, empRes, leaveRes] = await Promise.all([
          api.get("/payroll/analytics/overview"),
          api.get("/employees"),
          api.get("/leave"),
        ]);
        setStats(statsRes.data);
        setEmployees(empRes.data.users.filter((u) => u.role === "employee").slice(0, 5));
        setLeaves(leaveRes.data.leaves.filter((l) => l.status === "Pending").slice(0, 4));
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    {
      label: "Total employees",
      value: stats?.totalEmployees ?? "—",
      icon: Users,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Present today",
      value: stats?.presentToday ?? "—",
      icon: CalendarCheck,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending leave requests",
      value: stats?.pendingLeaves ?? "—",
      icon: FileClock,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Monthly net payroll",
      value: stats ? formatCurrency(stats.totalPayroll) : "—",
      icon: Wallet,
      tone: "bg-sky-50 text-sky-700",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="HR overview"
        title="Team overview"
        description="A snapshot of headcount, attendance, and pending approvals across Dayflow."
      />

      {error && (
        <p className="mb-6 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">{error}</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.label}>
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${c.tone}`}>
              <c.icon size={20} />
            </div>
            <p className="mt-4 text-2xl font-display font-bold text-ink-900">
              {loading ? "…" : c.value}
            </p>
            <p className="mt-1 text-xs text-ink-500">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card padded={false}>
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="font-display font-semibold text-ink-900">Employees</h2>
            <Link to="/employees" className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
              View all
            </Link>
          </div>
          {!loading && employees.length === 0 ? (
            <EmptyState icon={Users} title="No employees yet" description="Employees will appear here once they sign up." />
          ) : (
            <ul className="divide-y divide-ink-100">
              {employees.map((e) => (
                <li key={e.id} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink-800">{e.name}</p>
                    <p className="text-xs text-ink-500">{e.department} · {e.employeeId}</p>
                  </div>
                  <Link
                    to={`/employees/${e.id}`}
                    className="text-xs font-medium text-indigo-700 hover:text-indigo-800"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padded={false}>
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="font-display font-semibold text-ink-900">Pending approvals</h2>
            <Link to="/leave" className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
              Review all
            </Link>
          </div>
          {!loading && leaves.length === 0 ? (
            <EmptyState icon={FileClock} title="All caught up" description="There are no pending leave requests right now." />
          ) : (
            <ul className="divide-y divide-ink-100">
              {leaves.map((l) => (
                <li key={l.id} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink-800">{l.employeeName}</p>
                    <p className="text-xs text-ink-500">
                      {l.type} · {formatDate(l.startDate)} – {formatDate(l.endDate)}
                    </p>
                  </div>
                  <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
